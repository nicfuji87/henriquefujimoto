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
    }
};
