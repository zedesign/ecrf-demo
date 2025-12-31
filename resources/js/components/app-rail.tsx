import { router } from '@inertiajs/react';
import { LayoutDashboard, Settings } from 'lucide-react';

interface AppRailProps {
    currentUrl: string;
}

export function AppRail({ currentUrl }: AppRailProps) {
    const isSettings = currentUrl.startsWith('/admin');

    return (
        <aside className="w-[68px] flex flex-col items-center py-6 bg-dark-cyan-950 dark:bg-rail-background text-dark-cyan-400 shrink-0 z-20 border-r border-white/5 dark:border-border transition-colors duration-300">
            {/* LOGO */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-cyan-600 font-bold text-white uppercase text-xs tracking-tighter shadow-lg shadow-black/20">
                eCRF
            </div>
            
            {/* NAVIGATION */}
            <nav className="flex flex-1 flex-col items-center justify-center space-y-6">
                <RailIcon 
                    icon={LayoutDashboard} 
                    label="Mes Études" // Label plus explicite selon ton souhait
                    active={!isSettings} 
                    // ✅ AJOUT DU PARAMÈTRE : Cela permet de forcer l'affichage du Dashboard
                    onClick={() => router.visit('/dashboard?show-all=true')} 
                />
                <RailIcon 
                    icon={Settings} 
                    label="Administration"
                    active={isSettings} 
                    onClick={() => router.visit('/admin/settings/users')} 
                />
            </nav>
        </aside>
    );
}

function RailIcon({ icon: Icon, label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick} 
            className="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 outline-none"
        >
            {/* Le bouton */}
            {/* ✅ dark:bg-white/10 pour les états hover en dark mode */}
            <div className={`flex h-full w-full items-center justify-center rounded-2xl transition-all ${
                active 
                ? 'bg-dark-cyan-900 dark:bg-primary/20 text-white dark:text-primary' 
                : 'hover:bg-dark-cyan-900/50 dark:hover:bg-white/5 text-dark-cyan-500 dark:text-slate-500 hover:text-dark-cyan-100 dark:hover:text-slate-200'
            }`}>
                <Icon size={24} />
            </div>
            
            {/* Indicateur latéral */}
            {active && (
                <div className="absolute left-0 h-6 w-1 rounded-r-full bg-dark-cyan-500 dark:bg-primary" />
            )}

            {/* TOOLTIP */}
            <div className="absolute left-16 bg-dark-cyan-800 dark:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-sm border border-dark-cyan-700 dark:border-slate-700">
                {label}
            </div>
        </button>
    );
}