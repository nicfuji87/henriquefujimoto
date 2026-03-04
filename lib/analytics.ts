import { supabase } from './supabase';

type EventParams = {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
};

interface EventLogOptions {
    tracking_event_id?: string | null;
    source_type: 'product' | 'card';
    source_id?: string;
    source_label?: string;
}

function logEventToSupabase(eventName: string, opts: EventLogOptions) {
    supabase.from('tracking_event_logs').insert({
        tracking_event_id: opts.tracking_event_id || null,
        event_name: eventName,
        source_type: opts.source_type,
        source_id: opts.source_id || null,
        source_label: opts.source_label || null,
        referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent || null : null,
    }).then(({ error }) => {
        if (error) console.error('[EventLog] insert error:', error.message);
        else if (process.env.NODE_ENV === 'development') console.log('[EventLog] saved:', eventName);
    });
}

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Envia evento para a Meta Conversions API via Edge Function (server-side).
 * Funciona mesmo se o usuário tiver AdBlock, pois o disparo é feito
 * pelo nosso servidor e não pelo navegador.
 */
function sendToCAPI(eventName: string, customData?: Record<string, any>) {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) return;

        const payload = {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: typeof window !== 'undefined' ? window.location.href : '',
            action_source: 'website',
            user_data: {
                client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                fbc: getCookie('_fbc'),
                fbp: getCookie('_fbp'),
            },
            custom_data: customData || {},
        };

        fetch(`${supabaseUrl}/functions/v1/meta-conversions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(res => {
            if (process.env.NODE_ENV === 'development') {
                res.json().then(data => console.log('[CAPI]', eventName, data));
            }
        }).catch(() => { /* fire-and-forget */ });
    } catch (_) {
        // silently ignore
    }
}

/**
 * Envia um evento personalizado para o Google Analytics 4 (GA4)
 * @param action Nome do evento (ex: 'click_cta', 'contact_whatsapp')
 * @param params Parâmetros adicionais para detalhamento
 */
export const trackEvent = (action: string, params?: EventParams) => {
    if (typeof window !== 'undefined') {
        const win = window as any;

        // Disparo GA4
        if (win.gtag) {
            win.gtag('event', action, params);
        }

        // Disparo Meta Pixel (Facebook)
        if (win.fbq) {
            // Se for um evento padrão do Meta (AddToCart, Lead, etc), usamos 'track'
            // Se for customizado (click_cta, affiliate_click), usamos 'trackCustom'
            const standardEvents = ['AddToCart', 'AddToWishlist', 'CompleteRegistration', 'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout', 'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication', 'Subscribe', 'ViewContent'];

            if (standardEvents.includes(action)) {
                win.fbq('track', action, params);
            } else {
                win.fbq('trackCustom', action, params);
            }
        }

        // Log para facilitar debug em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics Event] ${action}`, params);
        }
    }
};

/**
 * Atalhos para eventos comuns do site
 */
export const analytics = {
    // Generic Track
    trackEvent,

    // Cliques em Botões de Chamada para Ação (CTA)
    trackCTA: (location: string, text: string) => {
        trackEvent('cta_click', {
            event_category: 'engagement',
            event_label: text,
            location: location // ex: 'hero', 'sticky_footer', 'why_support'
        });
    },

    // Cliques em Parceiros / Patrocinadores
    trackPartnerClick: (partnerName: string) => {
        trackEvent('partner_click', {
            event_category: 'outbound',
            event_label: partnerName
        });
    },

    // Contato via WhatsApp
    trackWhatsApp: (location: string) => {
        trackEvent('contact_whatsapp', {
            event_category: 'conversion',
            location: location
        });
    },

    // Blog
    trackBlogShare: (slug: string, platform: string) => {
        trackEvent('share', {
            method: platform,
            content_type: 'blog_post',
            item_id: slug
        });
    },

    // Produtos Afiliados (Mercado Livre)
    trackAffiliateClick: (productName: string, productId: string) => {
        trackEvent('Click_Affiliate_Product', {
            event_category: 'affiliate',
            event_label: productName,
            product_id: productId,
            currency: 'BRL'
        });
        // Log no Supabase
        logEventToSupabase('Click_Affiliate_Product', {
            source_type: 'product',
            source_id: productId,
            source_label: productName,
        });
        // Meta CAPI (server-side)
        sendToCAPI('Click_Affiliate_Product', {
            content_name: productName,
            content_ids: [productId],
            content_type: 'product',
            currency: 'BRL',
        });
    },

    /**
     * Dispara um evento dinâmico vindo do banco de dados (tracking_events).
     * Usa 'track' para eventos padrão Meta e 'trackCustom' para custom.
     * Também registra o evento no Supabase com data/hora.
     */
    trackDynamicEvent: (event: {
        id?: string;
        event_name: string;
        is_standard_meta: boolean;
        meta_params?: Record<string, any>;
        ga4_params?: Record<string, any>;
    }, extraParams?: Record<string, any>, logOpts?: EventLogOptions) => {
        const ga4Merged = { ...event.ga4_params, ...extraParams };
        const metaMerged = { ...event.meta_params, ...extraParams };

        // GA4
        if (typeof window !== 'undefined') {
            const win = window as any;
            if (win.gtag) {
                win.gtag('event', event.event_name, ga4Merged);
            }
            // Meta Pixel
            if (win.fbq) {
                if (event.is_standard_meta) {
                    win.fbq('track', event.event_name, metaMerged);
                } else {
                    win.fbq('trackCustom', event.event_name, metaMerged);
                }
            }
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Dynamic Event] ${event.event_name}`, { ga4Merged, metaMerged });
            }
        }

        // Log no Supabase
        if (logOpts) {
            logEventToSupabase(event.event_name, {
                tracking_event_id: event.id || logOpts.tracking_event_id,
                ...logOpts,
            });
        }

        // Meta CAPI (server-side)
        sendToCAPI(event.event_name, { ...metaMerged, ...extraParams });
    }
};
