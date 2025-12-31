// components/sidebar/sidebar-nav-main.tsx
import { LayoutDashboard, FlaskConical } from 'lucide-react';
import { MenuButton } from './menu-button';

export function SidebarNavMain({ currentUrl }: { currentUrl: string }) {
    return (
        <>
            <MenuButton 
                href="/dashboard" 
                icon={LayoutDashboard} 
                label="Tableau de bord" 
                active={currentUrl === '/dashboard'} 
            />
            <MenuButton 
                href="/studies" 
                icon={FlaskConical} 
                label="Mes Études" 
                active={currentUrl.startsWith('/studies')} 
            />
        </>
    );
}