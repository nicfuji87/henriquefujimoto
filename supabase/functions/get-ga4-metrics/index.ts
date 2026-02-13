
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as jose from "https://esm.sh/jose@4.14.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(credentials: any) {
    const alg = 'RS256';
    const privateKey = await jose.importPKCS8(credentials.private_key, alg);

    const jwt = await new jose.SignJWT({
        scope: 'https://www.googleapis.com/auth/analytics.readonly'
    })
        .setProtectedHeader({ alg })
        .setIssuer(credentials.client_email)
        .setAudience('https://oauth2.googleapis.com/token')
        .setExpirationTime('1h')
        .setIssuedAt()
        .sign(privateKey);

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const data = await res.json();
    return data.access_token;
}

async function runReport(accessToken: string, propertyId: string, requestBody: any) {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`GA4 API Error: ${res.status} ${err}`);
    }

    return await res.json();
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const propertyId = Deno.env.get("GA4_PROPERTY_ID");
        const credentialsJson = Deno.env.get("GA4_CREDENTIALS");
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        // Check essential config
        if (!propertyId || !credentialsJson || !supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({
                    error: "Missing Configuration (GA4 or Supabase)",
                    mock: true
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const credentials = JSON.parse(credentialsJson);

        // Get Access Token
        const accessToken = await getAccessToken(credentials);

        // Determine mode: "sync" (cron job) or "fetch" (dashboard display)
        const url = new URL(req.url);
        const mode = url.searchParams.get("mode") || "fetch"; // fetch | sync

        if (mode === "sync") {
            // --- SYNC MODE (Daily Cron) ---
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

            // 1. Site Metrics (Overall)
            const siteReport = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
                metrics: [
                    { name: "activeUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "engagementRate" },
                ],
            });

            const siteMetrics = siteReport.rows?.[0]?.metricValues;

            if (siteMetrics && siteMetrics.length > 0) {
                await supabase.from("daily_site_metrics").upsert({
                    date: dateStr,
                    active_users: parseInt(siteMetrics[0]?.value || "0"),
                    sessions: parseInt(siteMetrics[1]?.value || "0"),
                    screen_page_views: parseInt(siteMetrics[2]?.value || "0"),
                    engagement_rate: parseFloat(siteMetrics[3]?.value || "0"),
                }, { onConflict: "date" });
            }

            // 2. Blog Post Metrics (Per Page)
            const blogReport = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
                dimensions: [{ name: "pagePath" }],
                metrics: [
                    { name: "screenPageViews" },
                    { name: "activeUsers" },
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: "pagePath",
                        stringFilter: {
                            matchType: "BEGINS_WITH",
                            value: "/blog/"
                        }
                    }
                }
            });

            const blogRows = blogReport.rows || [];

            // Deduplicate and clean data
            const aggregated: Record<string, { views: number, users: number }> = {};

            for (const row of blogRows) {
                const path = row.dimensionValues?.[0]?.value || "";
                let slug = path.replace(/^\/blog\//, "");
                slug = slug.replace(/\/$/, "");
                slug = slug.split('?')[0];

                if (!slug || slug === 'blog') continue;

                const views = parseInt(row.metricValues?.[0]?.value || "0");
                const users = parseInt(row.metricValues?.[1]?.value || "0");

                if (!aggregated[slug]) {
                    aggregated[slug] = { views: 0, users: 0 };
                }
                aggregated[slug].views += views;
                aggregated[slug].users += users;
            }

            const blogInserts = Object.entries(aggregated).map(([slug, metrics]) => ({
                date: dateStr,
                post_slug: slug,
                page_views: metrics.views,
                active_users: metrics.users,
            }));

            if (blogInserts.length > 0) {
                await supabase.from("daily_blog_metrics").upsert(blogInserts, { onConflict: "date,post_slug" });
            }

            return new Response(JSON.stringify({
                success: true,
                date: dateStr,
                site_metrics_saved: !!siteMetrics,
                blog_posts_saved: blogInserts.length
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });

        } else {
            // --- FETCH MODE (Dashboard Display) ---
            // 1. Get Totals (30days)
            const response = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                metrics: [
                    { name: "activeUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "engagementRate" },
                ],
            });

            const totals = response.rows?.[0]?.metricValues || [];

            // 2. Get History (for chart)
            const historyResponse = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                dimensions: [{ name: "date" }],
                metrics: [{ name: "activeUsers" }],
                orderBys: [{ dimension: { orderType: "ALPHANUMERIC", dimensionName: "date" } }]
            });

            const history = historyResponse.rows?.map((row: any) => ({
                date: row.dimensionValues?.[0]?.value, // YYYYMMDD
                users: parseInt(row.metricValues?.[0]?.value || "0")
            })) || [];

            const formattedHistory = history.map((h: any) => ({
                date: h.date && h.date.length === 8
                    ? `${h.date.substring(0, 4)}-${h.date.substring(4, 6)}-${h.date.substring(6, 8)}`
                    : h.date,
                users: h.users
            }));

            // 3. Get Top Pages (Blog) - Live 30 days
            const topPagesResponse = await runReport(accessToken, propertyId, {
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }],
                dimensionFilter: {
                    filter: {
                        fieldName: "pagePath",
                        stringFilter: {
                            matchType: "BEGINS_WITH",
                            value: "/blog/"
                        }
                    }
                },
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
                limit: 5
            });

            const rawTopPages = topPagesResponse.rows || [];

            // Map to intermediate format
            let topPages = rawTopPages.map((row: any) => {
                const path = row.dimensionValues?.[0]?.value || "";
                let slug = path.replace(/^\/blog\//, "");
                slug = slug.replace(/\/$/, "");
                slug = slug.split('?')[0];

                return {
                    path,
                    slug,
                    views: parseInt(row.metricValues?.[0]?.value || "0"),
                    title: slug,
                    image: null as string | null
                };
            }).filter((p: any) => p.slug && p.slug !== 'blog' && p.slug !== '');

            // Fetch metadata from Supabase
            if (topPages.length > 0) {
                const uniqueSlugs = [...new Set(topPages.map((p: any) => p.slug))];

                const { data: posts, error: dbError } = await supabase
                    .from('posts')
                    .select('slug, title, image_url')
                    .in('slug', uniqueSlugs);

                if (!dbError && posts) {
                    topPages = topPages.map((p: any) => {
                        const post = posts.find((dbPost: any) => dbPost.slug === p.slug);
                        return {
                            ...p,
                            title: post?.title || p.title,
                            image: post?.image_url || null
                        };
                    });
                }
            }

            return new Response(
                JSON.stringify({
                    activeUsers: parseInt(totals?.[0]?.value || "0"),
                    sessions: parseInt(totals?.[1]?.value || "0"),
                    screenPageViews: parseInt(totals?.[2]?.value || "0"),
                    engagementRate: parseFloat(totals?.[3]?.value || "0"),
                    history: formattedHistory,
                    topPages: topPages
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (error) {
        let email = "unknown";
        try {
            email = JSON.parse(Deno.env.get("GA4_CREDENTIALS") || "{}").client_email;
        } catch { }

        console.error("Error processing GA4 request:", error);
        return new Response(JSON.stringify({
            error: error.message || String(error),
            stack: error.stack,
            service_account_email: email
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
