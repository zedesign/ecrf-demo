import '../css/app.css';

import { createInertiaApp, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster, toast } from 'sonner';

import { route as ziggyRoute } from 'ziggy-js';

(window as any).route = (name: any, params: any, absolute: any, config: any) => 
    ziggyRoute(name, params, absolute, config || (window as any).Ziggy);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// --- LE COMPOSANT RESTE LE MÊME ---
function FlashListener() {
    const { flash }: any = usePage().props;

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page: any = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );
        
        // --- LA MAGIE EST ICI ---
        // On entoure chaque page par le FlashListener au moment de la résolution
        page.default.layout = page.default.layout || ((page: any) => (
            <>
                <FlashListener />
                {page}
            </>
        ));
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                {/* Le Toaster peut rester ici car il n'utilise pas usePage */}
                <Toaster richColors position="top-right" closeButton />
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();