
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";
import { google } from "https://esm.sh/googleapis@126.0.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
        if (!propertyId || !credentialsJson) {
            return new Response(
                JSON.stringify({
                    error: "Missing GA4 configuration",
                    mock: true
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const credentials = JSON.parse(credentialsJson);

        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
        });

        const analyticsData = google.analyticsdata({
            version: "v1beta",
            auth,
        });

        // Determine mode: "sync" (cron job) or "fetch" (dashboard display)
        const url = new URL(req.url);
        const mode = url.searchParams.get("mode") || "fetch"; // fetch | sync

        if (mode === "sync") {
            // --- SYNC MODE (Daily Cron) ---
            // Fetch yesterday's data
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

            // 1. Site Metrics (Overall)
            const siteReport = await analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
                    metrics: [
                        { name: "activeUsers" },
                        { name: "sessions" },
                        { name: "screenPageViews" },
                        { name: "engagementRate" },
                    ],
                },
            });

            const siteMetrics = siteReport.data.rows?.[0]?.metricValues;

            if (siteMetrics) {
                await supabase.from("daily_site_metrics").upsert({
                    date: dateStr,
                    active_users: parseInt(siteMetrics[0]?.value || "0"),
                    sessions: parseInt(siteMetrics[1]?.value || "0"),
                    screen_page_views: parseInt(siteMetrics[2]?.value || "0"),
                    engagement_rate: parseFloat(siteMetrics[3]?.value || "0"),
                }, { onConflict: "date" });
            }

            // 2. Blog Post Metrics (Per Page)
            const blogReport = await analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
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
                },
            });

            const blogRows = blogReport.data.rows || [];
            const blogInserts = blogRows.map((row: any) => {
                const path = row.dimensionValues?.[0]?.value || "";
                // Extract slug from /blog/slug or /blog/slug?query
                const cleanPath = path.split('?')[0];
                const slug = cleanPath.replace("/blog/", "").replace(/\/$/, "");

                if (!slug) return null;

                return {
                    date: dateStr,
                    post_slug: slug,
                    page_views: parseInt(row.metricValues?.[0]?.value || "0"),
                    active_users: parseInt(row.metricValues?.[1]?.value || "0"),
                };
            }).filter((i: any) => i !== null);

            if (blogInserts.length > 0) {
                // Batch upsert might fail if duplicates in same batch for constraint?
                // Post slug + date is unique. If map produced duplicates (e.g. /blog/slug vs /blog/slug/), we should aggregate.
                // Simple aggregation:
                const aggregated = blogInserts.reduce((acc: any, curr: any) => {
                    const key = curr.post_slug;
                    if (!acc[key]) {
                        acc[key] = { ...curr };
                    } else {
                        acc[key].page_views += curr.page_views;
                        acc[key].active_users += curr.active_users;
                    }
                    return acc;
                }, {});

                await supabase.from("daily_blog_metrics").upsert(Object.values(aggregated), { onConflict: "date,post_slug" });
            }

            return new Response(JSON.stringify({ success: true, date: dateStr, blog_posts: blogInserts.length }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });

        } else {
            // --- FETCH MODE (Dashboard Display) ---
            // 1. Get Totals (30days)
            const response = await analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                    metrics: [
                        { name: "activeUsers" },
                        { name: "sessions" },
                        { name: "screenPageViews" },
                        { name: "engagementRate" },
                    ],
                },
            });

            const totals = response.data.rows?.[0]?.metricValues;

            // 2. Get History (for chart)
            const historyResponse = await analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                    dimensions: [{ name: "date" }],
                    metrics: [{ name: "activeUsers" }],
                    orderBys: [{ dimension: { orderType: "ALPHANUMERIC", dimensionName: "date" } }]
                }
            });

            const history = historyResponse.data.rows?.map((row: any) => ({
                date: row.dimensionValues?.[0]?.value, // YYYYMMDD
                users: parseInt(row.metricValues?.[0]?.value || "0")
            })) || [];

            // Transform date
            const formattedHistory = history.map((h: any) => ({
                date: h.date
                    ? `${h.date.substring(0, 4)}-${h.date.substring(4, 6)}-${h.date.substring(6, 8)}`
                    : '',
                users: h.users
            }));

            // 3. Get Top Pages (Blog) for Dashboard Highlights (Live 30 days)
            const topPagesResponse = await analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
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
                }
            });

            const rawTopPages = topPagesResponse.data.rows || [];

            // Extract slugs to query database
            const slugs = rawTopPages.map((row: any) => {
                const path = row.dimensionValues?.[0]?.value || "";
                const slug = path.replace(/^\/blog\//, "").replace(/\/$/, "").split('?')[0];
                return slug;
            }).filter((s: string) => s && s !== 'blog'); // Filter valid slugs

            let enrichedPages = rawTopPages.map((row: any) => {
                const path = row.dimensionValues?.[0]?.value || "";
                const slug = path.replace(/^\/blog\//, "").replace(/\/$/, "").split('?')[0];
                return {
                    path,
                    slug,
                    views: parseInt(row.metricValues?.[0]?.value || "0"),
                    title: slug, // Default to slug
                    image: null as string | null
                };
            }).filter((p: any) => p.slug && p.slug !== 'blog'); // Filter out the main blog page strictly

            // Fetch metadata from Supabase
            if (slugs.length > 0) {
                const { data: posts } = await supabase
                    .from('posts')
                    .select('slug, title, image_url')
                    .in('slug', slugs);

                if (posts) {
                    enrichedPages = enrichedPages.map((p: any) => {
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
                    topPages: enrichedPages
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (error) {
        console.error("Error processing GA4 request:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
