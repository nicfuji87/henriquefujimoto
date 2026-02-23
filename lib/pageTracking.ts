import { supabase } from './supabase';

// Generate a session ID (persists for browser tab lifetime)
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('hf_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('hf_session_id', sessionId);
    }
    return sessionId;
}

// Track a page view
export async function trackPageView(pagePath: string, pageTitle?: string) {
    try {
        const sessionId = getSessionId();

        await supabase.from('page_views').insert({
            page_path: pagePath,
            page_title: pageTitle || document.title,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: sessionId,
        });
    } catch (err) {
        // Silent fail — tracking should never break UX
        console.warn('[PageTracking] Error:', err);
    }
}
