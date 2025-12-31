import { ReactNode, useState } from 'react';
import { usePage, Head, router } from '@inertiajs/react';
import { AppRail } from '@/components/app-rail';
import { AppSidebarDynamic } from '@/components/sidebar/app-sidebar-dynamic';
import { Menu, X, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { cn } from "@/lib/utils"; 

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    study?: any;
    form?: any;
    isPreviewMode?: boolean; 
    isFullWidth?: boolean; 
    activeSectionId?: string | number;
    onSectionChange?: (id: string | number) => void;
    onFormChange?: (formId: string | number) => void; 
    onClosePreview?: () => void;
}

export default function AppLayout({ 
    children, 
    title, 
    breadcrumbs = [], 
    study, 
    form,
    isPreviewMode = false,
    isFullWidth = false, 
    activeSectionId,
    onSectionChange,
    onFormChange, 
    onClosePreview
}: AppLayoutProps) {
    const { url = '', props } = usePage();
    const { auth, activeStudy } = props as any;
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const currentStudy = study || activeStudy;
    
    // LOGIQUE DE DÉTECTION DES MODES
    const isAdmin = url.startsWith('/admin');
    const isUserSettings = url.startsWith('/settings');
    const isInsideStudy = url.startsWith('/studies/');
    const isBuilder = url.includes('/builder') || url.includes('/crfbuilder/') || !!form;

    // CORRECTION : On définit quand la sidebar doit être visible
    // On ajoute 'isAdmin' et 'isUserSettings' à la liste
    const shouldShowSidebar = isInsideStudy || isBuilder || isPreviewMode || isAdmin || isUserSettings;

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
            <Head title={title} />

            {/* --- DESKTOP : Rail --- */}
            <div className="hidden md:flex shrink-0">
                <AppRail currentUrl={url} />
            </div>
            
            {/* --- DESKTOP : Sidebar --- */}
            <div className="hidden md:flex shrink-0">
                {/* MODIFICATION ICI : On utilise la nouvelle condition large */}
                {shouldShowSidebar && (
                    <AppSidebarDynamic 
                        currentUrl={url} 
                        userName={auth.user?.name || 'Utilisateur'} 
                        study={currentStudy} 
                        form={form}
                        isPreview={isPreviewMode}
                        activeSectionId={activeSectionId}
                        onSectionChange={onSectionChange}
                        onFormChange={onFormChange}
                        onClosePreview={onClosePreview}
                    />
                )}
            </div>

            {/* --- ZONE PRINCIPALE --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {!isPreviewMode && (
                    <header className="md:hidden h-16 bg-card border-b border-border flex items-center justify-between px-5 shrink-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-dark-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                eC
                            </div>
                            <span className="font-bold text-foreground text-sm tracking-tight">
                                {isAdmin ? 'Administration' : (isInsideStudy ? currentStudy?.protocol_code : 'Plateforme')}
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </header>
                )}

                <div className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar",
                    (isPreviewMode || isFullWidth) ? "p-0" : "p-4 md:p-8 pb-24 md:pb-8"
                )}>
                    {children}
                </div>

                {!isPreviewMode && (
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-card border-t border-border flex items-center justify-around px-4 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                        <MobileTabButton 
                            icon={LayoutDashboard} 
                            active={!isAdmin && !isUserSettings} 
                            onClick={() => router.visit('/studies')} 
                        />
                        <MobileTabButton 
                            icon={Settings} 
                            active={isAdmin || isUserSettings} 
                            onClick={() => router.visit('/admin/settings/users')} 
                        />
                        <button 
                            onClick={() => router.post('/logout')}
                            className="flex flex-col items-center justify-center p-2 text-red-500 active:scale-90 transition-transform"
                        >
                            <LogOut size={22} />
                        </button>
                    </nav>
                )}
            </main>

            {/* --- OVERLAY MENU MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                    />
                    
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                            <span className="font-bold text-foreground">
                                {isAdmin ? 'Administration' : (isInsideStudy ? 'Menu Étude' : 'Menu principal')}
                            </span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {/* MODIFICATION ICI AUSSI POUR LE MOBILE */}
                            {shouldShowSidebar && (
                                <AppSidebarDynamic 
                                    currentUrl={url} 
                                    userName={auth.user?.name || 'Utilisateur'} 
                                    study={currentStudy} 
                                    form={form} 
                                    isPreview={isPreviewMode}
                                    activeSectionId={activeSectionId}
                                    onSectionChange={onSectionChange}
                                    onFormChange={onFormChange}
                                />
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

function MobileTabButton({ icon: Icon, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-95 ${
                active 
                ? 'text-white bg-dark-cyan-600 w-16 h-12 shadow-lg shadow-dark-cyan-600/20' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            <Icon size={24} />
        </button>
    );
}