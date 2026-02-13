type EventParams = {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
};

/**
 * Envia um evento personalizado para o Google Analytics 4 (GA4)
 * @param action Nome do evento (ex: 'click_cta', 'contact_whatsapp')
 * @param params Parâmetros adicionais para detalhamento
 */
export const trackEvent = (action: string, params?: EventParams) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, params);

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
    }
};
