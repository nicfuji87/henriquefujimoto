import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Setup Supabase Client
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Note: In the user's secrets screenshot, the access token is saved as META_TOKEN_ID
const FB_ACCESS_TOKEN = Deno.env.get('META_TOKEN_ID')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const API_VERSION = 'v24.0';

Deno.serve(async (req) => {
    try {
        if (!FB_ACCESS_TOKEN) {
            throw new Error('META_TOKEN_ID secret is missing.');
        }

        // 1. Fetch Ad Account ID linked to the user
        const adAccountsReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/me/adaccounts?fields=name,account_id,business&access_token=${FB_ACCESS_TOKEN}`
        );
        const adAccountsData = await adAccountsReq.json();

        if (adAccountsData.error) {
            throw new Error(`FB Error fetching ad accounts: ${adAccountsData.error.message}`);
        }

        if (!adAccountsData.data || adAccountsData.data.length === 0) {
            throw new Error('No Ad Accounts found for this token.');
        }

        // We use the first ad account in the list.
        const actAccountId = `act_${adAccountsData.data[0].account_id}`;
        console.log(`Using Ad Account: ${actAccountId}`);

        // 2. Fetch Daily Ads Metrics (level=ad)
        // We will fetch for 'yesterday'. For daily cron jobs running early AM, yesterday gives the full completed day.
        // We can also allow an override via request params for "today"
        let preset = 'yesterday';
        if (req.method === 'POST') {
            const body = await req.json().catch(() => ({}));
            if (body.preset) {
                preset = body.preset;
            }
        }

        const metricsFields = 'campaign_name,adset_name,ad_name,spend,impressions,clicks,cpc,ctr,actions';
        const url = `https://graph.facebook.com/${API_VERSION}/${actAccountId}/insights?level=ad&fields=${metricsFields}&date_preset=${preset}&access_token=${FB_ACCESS_TOKEN}`;

        const insightsReq = await fetch(url);
        const insightsData = await insightsReq.json();

        if (insightsData.error) {
            throw new Error(`FB Error fetching insights: ${insightsData.error.message}`);
        }

        const rawDataArray = insightsData.data || [];
        console.log(`Fetched ${rawDataArray.length} items from Meta Ads API`);

        const formattedData = [];

        // Process data
        for (const ad of rawDataArray) {
            let initiates = 0;
            let purchases = 0;
            let purchasesValue = 0;

            if (ad.actions) {
                for (const action of ad.actions) {
                    if (action.action_type === 'initiate_checkout' || action.action_type === 'onsite_web_initiate_checkout') {
                        initiates += parseFloat(action.value || '0');
                    }
                    if (action.action_type === 'purchase' || action.action_type === 'onsite_web_purchase') {
                        purchases += parseFloat(action.value || '0');
                    }
                }
            }

            if (ad.action_values) {
                for (const val of ad.action_values) {
                    if (val.action_type === 'purchase' || val.action_type === 'onsite_web_purchase') {
                        purchasesValue += parseFloat(val.value || '0');
                    }
                }
            }

            formattedData.push({
                date: ad.date_start,
                campaign_name: ad.campaign_name || 'Desconhecido',
                adset_name: ad.adset_name || 'Desconhecido',
                ad_name: ad.ad_name || 'Desconhecido',
                spend_brl: parseFloat(ad.spend || '0'),
                impressions: parseInt(ad.impressions || '0'),
                clicks: parseInt(ad.clicks || '0'),
                cpc_brl: parseFloat(ad.cpc || '0'),
                ctr_percentage: parseFloat(ad.ctr || '0'),
                checkouts: initiates,
                purchases: purchases,
                revenue_brl: purchasesValue,
                raw_actions: ad.actions || []
            });
        }

        // Insert into Supabase
        if (formattedData.length > 0) {
            const { error: upsertError } = await supabase
                .from('ads_daily_insights')
                .upsert(formattedData, { onConflict: 'date, campaign_name, adset_name, ad_name' });

            if (upsertError) {
                throw new Error(`Supabase Upsert Error: ${upsertError.message}`);
            }
        }

        return new Response(JSON.stringify({ success: true, count: formattedData.length, data: formattedData }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e: any) {
        console.error('Error fetching ads metrics:', e.message);
        return new Response(JSON.stringify({ success: false, error: e.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
