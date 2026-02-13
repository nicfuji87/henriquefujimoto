import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface TrackingConfig {
    ga4_measurement_id: string;
    google_search_console_verification: string;
    google_tag_manager_id: string;
    meta_pixel_id: string;
    meta_domain_verification: string;
    tiktok_pixel_id: string;
    custom_head_scripts: string;
    site_title: string;
    site_description: string;
    site_keywords: string;
    og_default_image: string;
}

let cachedConfig: TrackingConfig | null = null;

export function useTracking() {
    const [config, setConfig] = useState<TrackingConfig | null>(cachedConfig);

    const location = useLocation();

    useEffect(() => {
        if (cachedConfig) {
            injectScripts(cachedConfig);
            return;
        }

        async function load() {
            try {
                const { data, error } = await supabase
                    .from('tracking_config')
                    .select('*')
                    .limit(1)
                    .single();

                if (error || !data) return;

                cachedConfig = data;
                setConfig(data);
                injectScripts(data);
            } catch (err) {
                console.error('Error loading tracking config:', err);
            }
        }

        load();
    }, []);

    // Track PageView on route change
    useEffect(() => {
        if (!config) return;

        // Small delay to ensure title is updated
        const timeout = setTimeout(() => {
            // GA4
            if ((window as any).gtag) {
                (window as any).gtag('event', 'page_view', {
                    page_path: location.pathname + location.search,
                    page_title: document.title
                });
            }

            // Meta Pixel
            if ((window as any).fbq) {
                (window as any).fbq('track', 'PageView');
            }

            // TikTok Pixel
            if ((window as any).ttq) {
                (window as any).ttq.page();
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [location, config]);

    return config;
}

function injectScripts(config: TrackingConfig) {
    // Prevent duplicate injection
    if (document.getElementById('tracking-injected')) return;
    const marker = document.createElement('meta');
    marker.id = 'tracking-injected';
    document.head.appendChild(marker);

    // === SEO Meta Tags ===
    setMeta('description', config.site_description);
    setMeta('keywords', config.site_keywords);
    setOG('og:title', config.site_title);
    setOG('og:description', config.site_description);
    setOG('og:type', 'website');
    setOG('og:url', window.location.origin);
    if (config.og_default_image) {
        setOG('og:image', config.og_default_image);
    }

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', config.site_title);
    setMeta('twitter:description', config.site_description);
    if (config.og_default_image) {
        setMeta('twitter:image', config.og_default_image);
    }

    // === Google Search Console ===
    if (config.google_search_console_verification) {
        setMeta('google-site-verification', config.google_search_console_verification);
    }

    // === Meta Domain Verification ===
    if (config.meta_domain_verification) {
        setMeta('facebook-domain-verification', config.meta_domain_verification);
    }

    // === Google Tag Manager ===
    if (config.google_tag_manager_id) {
        const gtmScript = document.createElement('script');
        gtmScript.textContent = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${config.google_tag_manager_id}');
        `;
        document.head.appendChild(gtmScript);

        // GTM noscript (for body)
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.google_tag_manager_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.prepend(noscript);
    }

    // === Google Analytics 4 (only if no GTM, to avoid duplication) ===
    if (config.ga4_measurement_id && !config.google_tag_manager_id) {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4_measurement_id}`;
        document.head.appendChild(gaScript);

        const gaInit = document.createElement('script');
        gaInit.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.ga4_measurement_id}');
        `;
        document.head.appendChild(gaInit);
    }

    // === Meta Pixel ===
    if (config.meta_pixel_id) {
        const fbScript = document.createElement('script');
        fbScript.textContent = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.meta_pixel_id}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(fbScript);

        const fbNoscript = document.createElement('noscript');
        fbNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${config.meta_pixel_id}&ev=PageView&noscript=1"/>`;
        document.body.appendChild(fbNoscript);
    }

    // === TikTok Pixel ===
    if (config.tiktok_pixel_id) {
        const ttScript = document.createElement('script');
        ttScript.textContent = `
            !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
            ttq.load('${config.tiktok_pixel_id}');
            ttq.page();
            }(window, document, 'ttq');
        `;
        document.head.appendChild(ttScript);
    }

    // === Custom head scripts ===
    if (config.custom_head_scripts) {
        const customDiv = document.createElement('div');
        customDiv.innerHTML = config.custom_head_scripts;
        while (customDiv.firstChild) {
            document.head.appendChild(customDiv.firstChild);
        }
    }

    // Set page title
    if (config.site_title && !document.title.includes('Blog')) {
        document.title = config.site_title;
    }
}

function setMeta(name: string, content: string) {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setOG(property: string, content: string) {
    if (!content) return;
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}
