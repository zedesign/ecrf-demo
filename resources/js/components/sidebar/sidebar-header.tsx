// components/sidebar/sidebar-header.tsx
export function SidebarHeader({ mode }: { mode: 'admin' | 'settings' | 'app' }) {
    const titles = {
        admin: 'Administration',
        settings: 'Mon Compte',
        app: 'Gestion des données'
    };

    return (
        <div className="shrink-0 p-8 pb-2">
            <div className="flex flex-col">
                <span className="text-xl font-black text-foreground tracking-tight leading-none">
                    eCRF<span className="text-dark-cyan-600">.</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1.5">
                    {titles[mode]}
                </span>
            </div>
        </div>
    );
}