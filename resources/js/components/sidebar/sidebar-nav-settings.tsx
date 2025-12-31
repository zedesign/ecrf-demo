// components/sidebar/sidebar-nav-settings.tsx
import { User, Lock, Palette, ShieldCheck } from 'lucide-react';
import { MenuButton } from './menu-button'; // On va créer ce petit helper aussi

export function SidebarNavSettings({ currentUrl }: { currentUrl: string }) {
    return (
        <>
            <MenuButton href="/settings/profile" icon={User} label="Profil" active={currentUrl.includes('/profile')} />
            <MenuButton href="/settings/password" icon={Lock} label="Mot de passe" active={currentUrl.includes('/password')} />
            <MenuButton href="/settings/appearance" icon={Palette} label="Apparence" active={currentUrl.includes('/appearance')} />
            <MenuButton href="/settings/two-factor" icon={ShieldCheck} label="Sécurité 2FA" active={currentUrl.includes('/two-factor')} />
        </>
    );
}