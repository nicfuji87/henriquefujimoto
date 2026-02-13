
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

        // If missing config, return mock/empty data with a flag
        if (!propertyId || !credentialsJson) {
            console.log("Missing GA4_PROPERTY_ID or GA4_CREDENTIALS");
            return new Response(
                JSON.stringify({
                    activeUsers: 0,
                    sessions: 0,
                    screenPageViews: 0,
                    engagementRate: 0,
                    history: [],
                    mock: true,
                    message: "Configure GA4_CREDENTIALS and GA4_PROPERTY_ID in Supabase Secrets"
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

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

        // Transform date YYYYMMDD to ISO YYYY-MM-DD
        const formattedHistory = history.map((h: any) => ({
            date: h.date
                ? `${h.date.substring(0, 4)}-${h.date.substring(4, 6)}-${h.date.substring(6, 8)}`
                : '',
            users: h.users
        }));

        return new Response(
            JSON.stringify({
                activeUsers: parseInt(totals?.[0]?.value || "0"),
                sessions: parseInt(totals?.[1]?.value || "0"),
                screenPageViews: parseInt(totals?.[2]?.value || "0"),
                engagementRate: parseFloat(totals?.[3]?.value || "0"),
                history: formattedHistory,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error fetching GA4 data:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
