import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const API_VERSION = 'v24.0'

Deno.serve(async (_req) => {
    try {
        // 1. Get the Facebook User ID & Pages
        const meReq = await fetch(`https://graph.facebook.com/${API_VERSION}/me?fields=id,name,accounts&access_token=${FB_ACCESS_TOKEN}`)
        const meData = await meReq.json()
        if (meData.error) throw new Error(`FB Error (Me): ${meData.error.message}`)

        // 2. Find the Instagram Business Account ID
        const pages = meData.accounts?.data || []
        let igUserId = null

        for (const page of pages) {
            const pageReq = await fetch(`https://graph.facebook.com/${API_VERSION}/${page.id}?fields=instagram_business_account&access_token=${FB_ACCESS_TOKEN}`)
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

        // 3. Fetch Metrics (Using v24.0 valid metric names)

        // A. Profile Basic Data
        const profileReq = await fetch(`https://graph.facebook.com/${API_VERSION}/${igUserId}?fields=followers_count,media_count&access_token=${FB_ACCESS_TOKEN}`)
        const profileData = await profileReq.json()
        console.log('Profile:', JSON.stringify(profileData))

        // B. Daily Reach (period=day, does NOT need metric_type)
        const reachDayReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=reach&period=day&access_token=${FB_ACCESS_TOKEN}`
        )
        const reachDayData = await reachDayReq.json()
        console.log('Reach day error?', reachDayData.error ? JSON.stringify(reachDayData.error) : 'No error')

        // C. Daily Total Value Metrics (require metric_type=total_value)
        const totalValueMetrics = 'profile_views,website_clicks,total_interactions,accounts_engaged,likes,comments,shares,saves,replies,follows_and_unfollows,profile_links_taps'
        const totalValueDayReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=${totalValueMetrics}&period=day&metric_type=total_value&access_token=${FB_ACCESS_TOKEN}`
        )
        const totalValueDayData = await totalValueDayReq.json()
        console.log('Total value day error?', totalValueDayData.error ? JSON.stringify(totalValueDayData.error) : 'No error')

        // D. 28-day Reach
        const reach28dReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=reach&period=days_28&access_token=${FB_ACCESS_TOKEN}`
        )
        const reach28dData = await reach28dReq.json()
        console.log('Reach 28d error?', reach28dData.error ? JSON.stringify(reach28dData.error) : 'No error')

        // E. 28-day Total Value Metrics
        const totalValue28dReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=${totalValueMetrics},follower_count&period=days_28&metric_type=total_value&access_token=${FB_ACCESS_TOKEN}`
        )
        const totalValue28dData = await totalValue28dReq.json()
        console.log('Total value 28d error?', totalValue28dData.error ? JSON.stringify(totalValue28dData.error) : 'No error')

        // F. Audience Demographics (lifetime)
        const audienceMetrics = 'engaged_audience_demographics,reached_audience_demographics,follower_demographics'
        const audienceReq = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=${audienceMetrics}&period=lifetime&metric_type=total_value&access_token=${FB_ACCESS_TOKEN}`
        )
        const audienceData = await audienceReq.json()
        console.log('Audience error?', audienceData.error ? JSON.stringify(audienceData.error) : 'No error')

        // G. Online Followers (Safe fetch)
        let onlineFollowersData: any = {}
        try {
            const onlineReq = await fetch(
                `https://graph.facebook.com/${API_VERSION}/${igUserId}/insights?metric=online_followers&period=lifetime&access_token=${FB_ACCESS_TOKEN}`
            )
            const onlineRes = await onlineReq.json()
            if (!onlineRes.error) {
                onlineFollowersData = onlineRes
            }
        } catch (e) {
            console.log("Could not fetch online_followers", e)
        }

        // ==========================================
        // Fetch Recent Media (Top Content)
        // ==========================================
        const mediaFields = 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count'
        const mediaReq = await fetch(`https://graph.facebook.com/${API_VERSION}/${igUserId}/media?fields=${mediaFields}&limit=50&access_token=${FB_ACCESS_TOKEN}`)
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

            const { error: mediaError } = await supabase
                .from('top_content')
                .upsert(contentRecords, { onConflict: 'id' })

            if (mediaError) console.error("Error saving media:", mediaError)
            else console.log(`Saved ${contentRecords.length} media items.`)
        }

        // ==========================================
        // Process Data
        // ==========================================
        const getMetricValue = (data: any, metricName: string) => {
            if (!data?.data) return 0
            const metric = data.data.find((m: any) => m.name === metricName)
            // total_value metrics return { value: X } directly or as total_value.value
            const val = metric?.total_value?.value ?? metric?.values?.[0]?.value ?? 0
            return typeof val === 'number' ? val : 0
        }

        const getMetricComplexValue = (data: any, metricName: string) => {
            if (!data?.data) return {}
            const metric = data.data.find((m: any) => m.name === metricName)
            return metric?.total_value?.breakdowns?.[0]?.results ?? metric?.values?.[0]?.value ?? {}
        }

        // Daily values
        const reachDaily = getMetricValue(reachDayData, 'reach')
        const profileViewsDaily = getMetricValue(totalValueDayData, 'profile_views')
        const websiteClicks = getMetricValue(totalValueDayData, 'website_clicks')
        const totalInteractions = getMetricValue(totalValueDayData, 'total_interactions')
        const accountsEngaged = getMetricValue(totalValueDayData, 'accounts_engaged')
        const likesDaily = getMetricValue(totalValueDayData, 'likes')
        const commentsDaily = getMetricValue(totalValueDayData, 'comments')
        const sharesDaily = getMetricValue(totalValueDayData, 'shares')
        const savesDaily = getMetricValue(totalValueDayData, 'saves')
        const repliesDaily = getMetricValue(totalValueDayData, 'replies')
        const followsUnfollows = getMetricValue(totalValueDayData, 'follows_and_unfollows')
        const profileLinksTaps = getMetricValue(totalValueDayData, 'profile_links_taps')

        // 28-day values
        const reach28d = getMetricValue(reach28dData, 'reach')
        const followerCount28d = getMetricValue(totalValue28dData, 'follower_count')
        const totalInteractions28d = getMetricValue(totalValue28dData, 'total_interactions')

        // Audience demographics
        const engagedAudienceDemographics = getMetricComplexValue(audienceData, 'engaged_audience_demographics')
        const reachedAudienceDemographics = getMetricComplexValue(audienceData, 'reached_audience_demographics')
        const followerDemographics = getMetricComplexValue(audienceData, 'follower_demographics')

        // Online Followers
        const onlineFollowers = getMetricComplexValue(onlineFollowersData, 'online_followers')

        // 4. Insert into Supabase
        const today = new Date().toISOString().split('T')[0]

        const record = {
            date: today,
            followers_count: profileData.followers_count,
            media_count: profileData.media_count,
            reach_28d: reach28d,
            impressions_28d: totalInteractions28d,
            reach_daily: reachDaily,
            impressions_daily: totalInteractions,
            profile_views_daily: profileViewsDaily,
            email_contacts: accountsEngaged,
            phone_call_clicks: profileLinksTaps,
            text_message_clicks: 0,
            get_directions_clicks: 0,
            website_clicks: websiteClicks,
            audience_city: engagedAudienceDemographics,
            audience_country: reachedAudienceDemographics,
            audience_gender_age: followerDemographics,
            audience_locale: {},
            online_followers: onlineFollowers,
            raw_data: {
                profile: profileData,
                reach_day: reachDayData,
                total_value_day: totalValueDayData,
                reach_28d: reach28dData,
                total_value_28d: totalValue28dData,
                audience: audienceData,
                online_followers: onlineFollowersData,
                parsed: {
                    daily: {
                        reach: reachDaily,
                        profile_views: profileViewsDaily,
                        website_clicks: websiteClicks,
                        total_interactions: totalInteractions,
                        accounts_engaged: accountsEngaged,
                        likes: likesDaily,
                        comments: commentsDaily,
                        shares: sharesDaily,
                        saves: savesDaily,
                        replies: repliesDaily,
                        follows_and_unfollows: followsUnfollows,
                        profile_links_taps: profileLinksTaps
                    },
                    rolling_28d: {
                        reach: reach28d,
                        follower_count: followerCount28d,
                        total_interactions: totalInteractions28d
                    }
                }
            }
        }

        const { error: dbError } = await supabase
            .from('daily_metrics')
            .upsert(record, { onConflict: 'date' })

        if (dbError) throw new Error(`Supabase Error: ${dbError.message}`)

        console.log(`Successfully saved metrics for ${today}`)

        return new Response(JSON.stringify({ success: true, data: record }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
