import { router } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

interface MenuButtonProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active: boolean;
}

export function MenuButton({ href, icon: Icon, label, active }: MenuButtonProps) {
    return (
        <button 
            onClick={() => router.visit(href)} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                active 
                ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                : 'text-sidebar-foreground hover:bg-accent hover:text-foreground font-bold'
            }`}
        >
            <Icon 
                size={20} 
                className={active ? 'text-primary-foreground' : 'text-primary'} 
                strokeWidth={active ? 2.5 : 2} 
            />
            <span>{label}</span>
        </button>
    );
}