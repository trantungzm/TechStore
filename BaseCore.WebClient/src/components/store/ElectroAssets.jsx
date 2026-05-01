import { useEffect } from 'react';

const stylesheetUrls = [
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css',
    '/electro/lib/animate/animate.min.css',
    '/electro/lib/owlcarousel/assets/owl.carousel.min.css',
    '/electro/css/bootstrap.min.css',
    '/electro/css/style.css',
];

const scriptUrls = [
    '/electro/lib/wow/wow.min.js',
    '/electro/lib/easing/easing.min.js',
    '/electro/lib/waypoints/waypoints.min.js',
    '/electro/lib/owlcarousel/owl.carousel.min.js',
    '/electro/js/main.js',
];

const ElectroAssets = () => {
    useEffect(() => {
        const previousBodyClass = document.body.className;
        document.body.className = 'electro-body';

        const appendedLinks = stylesheetUrls.map((href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.electroAsset = 'true';
            document.head.appendChild(link);
            return link;
        });

        const appendedScripts = [];
        let cancelled = false;

        const loadScripts = async () => {
            for (const src of scriptUrls) {
                if (cancelled) {
                    return;
                }

                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = false;
                    script.dataset.electroAsset = 'true';
                    script.onload = resolve;
                    script.onerror = resolve;
                    document.body.appendChild(script);
                    appendedScripts.push(script);
                });
            }
        };

        loadScripts();

        return () => {
            cancelled = true;
            appendedLinks.forEach((link) => link.remove());
            appendedScripts.forEach((script) => script.remove());
            document.body.className = previousBodyClass || 'hold-transition sidebar-mini';
        };
    }, []);

    return null;
};

export default ElectroAssets;
