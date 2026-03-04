import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversionEvent {
    event_name: string;
    event_time?: number;
    event_source_url?: string;
    action_source?: string;
    user_data?: {
        client_ip_address?: string;
        client_user_agent?: string;
        fbc?: string;
        fbp?: string;
    };
    custom_data?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const pixelId = Deno.env.get("META_PIXEL_ID");
        const accessToken = Deno.env.get("META_CAPI_TOKEN");

        if (!pixelId || !accessToken) {
            return new Response(
                JSON.stringify({ error: "Missing META_PIXEL_ID or META_CAPI_TOKEN" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const body = await req.json();

        // Accept single event or array
        const events: ConversionEvent[] = Array.isArray(body.data) ? body.data : [body];

        // Get client IP from request headers (Supabase/Cloudflare passes it)
        const clientIp =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            "";

        const clientUserAgent = req.headers.get("user-agent") || "";

        // Build Meta CAPI payload
        const metaEvents = events.map((ev) => {
            const eventTime = ev.event_time || Math.floor(Date.now() / 1000);

            // Hash user data for Meta (they require SHA-256 hashing for PII)
            const userData: Record<string, any> = {
                client_ip_address: ev.user_data?.client_ip_address || clientIp,
                client_user_agent: ev.user_data?.client_user_agent || clientUserAgent,
            };

            // Pass fbc and fbp cookies if provided (for deduplication)
            if (ev.user_data?.fbc) userData.fbc = ev.user_data.fbc;
            if (ev.user_data?.fbp) userData.fbp = ev.user_data.fbp;

            return {
                event_name: ev.event_name,
                event_time: eventTime,
                event_source_url: ev.event_source_url || body.source_url || "",
                action_source: ev.action_source || "website",
                user_data: userData,
                custom_data: ev.custom_data || body.custom_data || {},
            };
        });

        // Send to Meta Conversions API v21.0
        const metaUrl = `https://graph.facebook.com/v21.0/${pixelId}/events`;

        const metaResponse = await fetch(metaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: metaEvents,
                access_token: accessToken,
            }),
        });

        const metaResult = await metaResponse.json();

        if (!metaResponse.ok) {
            console.error("[Meta CAPI] Error:", JSON.stringify(metaResult));
            return new Response(
                JSON.stringify({ success: false, error: metaResult }),
                { status: metaResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("[Meta CAPI] Success:", JSON.stringify(metaResult));

        return new Response(
            JSON.stringify({ success: true, meta_response: metaResult }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("[Meta CAPI] Unhandled error:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message || String(error) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
