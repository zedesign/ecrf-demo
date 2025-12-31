// components/sidebar/sidebar-user-footer.tsx
import { router } from '@inertiajs/react';
import { Settings, LogOut, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarUserFooter({ userName, userRole }: { userName: string, userRole: string }) {
    const initials = userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="p-4 shrink-0 border-t border-border bg-sidebar mt-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center p-3 rounded-2xl hover:bg-accent transition-all outline-none group text-left">
                        <Avatar className="h-10 w-10 rounded-xl border border-border">
                            <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 ml-3">
                            <p className="text-sm font-bold text-foreground truncate leading-tight">{userName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                                {userRole.replace('_', ' ')}
                            </p>
                        </div>
                        <ChevronsUpDown className="size-4 ml-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[224px] rounded-2xl shadow-xl border border-border p-2 bg-card z-[110]" side="top" align="center" sideOffset={12}>
                    <DropdownMenuItem onClick={() => router.visit('/settings/profile')} className="flex items-center gap-3 py-3 px-3 cursor-pointer rounded-xl focus:bg-accent">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Mon Compte</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-border" />
                        <DropdownMenuItem 
                            className="flex items-center gap-3 py-3 px-3 cursor-pointer rounded-xl text-red-500 focus:text-red-500 focus:bg-red-50 transition-colors" 
                            onSelect={() => router.post('/logout')}
                        >
                            <LogOut className="h-4 w-4 text-red-500" /> 
                            <span className="font-bold text-sm">Déconnexion</span>
                        </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}