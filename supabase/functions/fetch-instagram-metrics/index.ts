import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// SECURITY: Token is managed via Supabase Secrets.
const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN')!

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
    try {
        // 1. Get the Facebook User ID
        const meReq = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,accounts&access_token=${FB_ACCESS_TOKEN}`)
        const meData = await meReq.json()

        if (meData.error) throw new Error(`FB Error (Me): ${meData.error.message}`)

        // 2. Find the Instagram Business Account ID
        const pages = meData.accounts?.data || []
        let igUserId = null

        for (const page of pages) {
            const pageReq = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${FB_ACCESS_TOKEN}`)
            const pageData = await pageReq.json()
            if (pageData.instagram_business_account?.id) {
                igUserId = pageData.instagram_business_account.id
                break
            }
        }

        if (!igUserId) {
            throw new Error('No Instagram Business Account found linked to these pages.')
        }

        console.log(`Found IG User ID: ${igUserId}`)

        // 3. Fetch Metrics

        // A. Profile Basic Data
        const profileBasicReq = await fetch(`https://graph.facebook.com/v19.0/${igUserId}?fields=followers_count,media_count&access_token=${FB_ACCESS_TOKEN}`)
        const profileData = await profileBasicReq.json()

        // B. Daily Interaction Metrics
        const dailyMetrics = 'reach,impressions,profile_views,email_contacts,phone_call_clicks,text_message_clicks,get_directions_clicks,website_clicks,total_interactions'
        const insightsDayReq = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=${dailyMetrics}&period=day&access_token=${FB_ACCESS_TOKEN}`
        )
        const insightsDayData = await insightsDayReq.json()

        // C. Rolling 28 Days Metrics (Reach & Impressions)
        const insights28dReq = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=reach,impressions&period=days_28&access_token=${FB_ACCESS_TOKEN}`
        )
        const insights28dData = await insights28dReq.json()

        // D. Audience Demographics (Lifetime snapshot)
        const audienceMetrics = 'audience_city,audience_country,audience_gender_age,audience_locale'
        const audienceReq = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=${audienceMetrics}&period=lifetime&access_token=${FB_ACCESS_TOKEN}`
        )
        const audienceData = await audienceReq.json()

        // online_followers (Safe fetch)
        let onlineFollowersData = {}
        try {
            const onlineReq = await fetch(
                `https://graph.facebook.com/v19.0/${igUserId}/insights?metric=online_followers&period=lifetime&access_token=${FB_ACCESS_TOKEN}`
            )
            const onlineRes = await onlineReq.json()
            if (!onlineRes.error) {
                onlineFollowersData = onlineRes
            }
        } catch (e) {
            console.log("Could not fetch online_followers", e)
        }

        // ==========================================
        // NEW: Fetch Recent Media (Top Content)
        // ==========================================
        const mediaFields = 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count'
        // Fetch last 50 posts to ensure we get recent viral ones
        const mediaReq = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?fields=${mediaFields}&limit=50&access_token=${FB_ACCESS_TOKEN}`)
        const mediaData = await mediaReq.json()

        if (mediaData.data) {
            const contentRecords = mediaData.data.map((m: any) => ({
                id: m.id,
                media_type: m.media_type,
                media_url: m.media_url,
                thumbnail_url: m.thumbnail_url || m.media_url,
                caption: m.caption,
                permalink: m.permalink,
                like_count: m.like_count || 0,
                comments_count: m.comments_count || 0,
                timestamp: m.timestamp,
                last_updated: new Date().toISOString()
            }))

            // Insert into top_content table
            const { error: mediaError } = await supabase
                .from('top_content')
                .upsert(contentRecords, { onConflict: 'id' })

            if (mediaError) console.error("Error saving media:", mediaError)
            else console.log(`Saved ${contentRecords.length} media items.`)
        }


        // Process Data for Daily Metrics
        const getMetricValue = (data: any, metricName: string) => {
            const metric = data.data?.find((m: any) => m.name === metricName)
            return metric?.values[0]?.value || 0
        }

        const getMetricComplexValue = (data: any, metricName: string) => {
            const metric = data.data?.find((m: any) => m.name === metricName)
            return metric?.values[0]?.value || {}
        }

        // Daily
        const reachDaily = getMetricValue(insightsDayData, 'reach')
        const impressionsDaily = getMetricValue(insightsDayData, 'impressions')
        const profileViewsDaily = getMetricValue(insightsDayData, 'profile_views')
        const emailContacts = getMetricValue(insightsDayData, 'email_contacts')
        const phoneCallClicks = getMetricValue(insightsDayData, 'phone_call_clicks')
        const textMessageClicks = getMetricValue(insightsDayData, 'text_message_clicks')
        const getDirectionsClicks = getMetricValue(insightsDayData, 'get_directions_clicks')
        const websiteClicks = getMetricValue(insightsDayData, 'website_clicks')

        // 28 Days
        const reach28d = getMetricValue(insights28dData, 'reach')
        const impressions28d = getMetricValue(insights28dData, 'impressions')

        // Audience
        const audienceCity = getMetricComplexValue(audienceData, 'audience_city')
        const audienceCountry = getMetricComplexValue(audienceData, 'audience_country')
        const audienceGenderAge = getMetricComplexValue(audienceData, 'audience_gender_age')
        const audienceLocale = getMetricComplexValue(audienceData, 'audience_locale')

        // Online Followers
        const onlineFollowers = getMetricComplexValue(onlineFollowersData, 'online_followers')

        // 4. Insert into Supabase
        const today = new Date().toISOString().split('T')[0]

        const record = {
            date: today,
            followers_count: profileData.followers_count,
            media_count: profileData.media_count,
            reach_28d: reach28d,
            impressions_28d: impressions28d,
            reach_daily: reachDaily,
            impressions_daily: impressionsDaily,
            profile_views_daily: profileViewsDaily,
            email_contacts: emailContacts,
            phone_call_clicks: phoneCallClicks,
            text_message_clicks: textMessageClicks,
            get_directions_clicks: getDirectionsClicks,
            website_clicks: websiteClicks,
            audience_city: audienceCity,
            audience_country: audienceCountry,
            audience_gender_age: audienceGenderAge,
            audience_locale: audienceLocale,
            online_followers: onlineFollowers,
            raw_data: {
                profile: profileData,
                insights_day: insightsDayData,
                insights_28d: insights28dData,
                audience: audienceData,
                online_followers: onlineFollowersData
            }
        }

        const { error: dbError } = await supabase
            .from('daily_metrics')
            .upsert(record, { onConflict: 'date' })

        if (dbError) throw new Error(`Supabase Error: ${dbError.message}`)

        return new Response(JSON.stringify({ success: true, data: record }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
