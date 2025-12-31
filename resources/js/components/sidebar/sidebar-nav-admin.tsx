// components/sidebar/sidebar-nav-admin.tsx
import { Users, Shield, History, Building2 } from 'lucide-react';
import { MenuButton } from './menu-button';

export function SidebarNavAdmin({ currentUrl }: { currentUrl: string }) {
    return (
        <>
            <MenuButton 
                href="/admin/settings/users" 
                icon={Users} 
                label="Utilisateurs" 
                active={currentUrl.includes('/users')} 
            />
            <MenuButton 
                href="/admin/settings/roles" 
                icon={Shield} 
                label="Rôles" 
                active={currentUrl.includes('/roles')} 
            />
            <MenuButton 
                href="/admin/settings/centers" 
                icon={Building2} 
                label="Centres" 
                active={currentUrl.includes('/centers')} 
            />
            <MenuButton 
                href="/admin/settings/audits" 
                icon={History} 
                label="Audit Trail" 
                active={currentUrl.includes('/audits')} 
            />
        </>
    );
}