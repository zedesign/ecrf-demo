import React from 'react';
import { usePage } from '@inertiajs/react';
import { SidebarHeader } from './sidebar-header';
import { SidebarNavSettings } from './sidebar-nav-settings';
import { SidebarNavAdmin } from './sidebar-nav-admin'; 
import { SidebarNavMain } from './sidebar-nav-main';    
import { SidebarStudySelect } from './sidebar-study-select'; 
import { SidebarUserFooter } from './sidebar-user-footer';
import { SidebarNavStudy } from './sidebar-nav-study';
import { SidebarNavBuilder } from './sidebar-nav-builder';
import { SidebarNavPreview } from './sidebar-nav-preview'; 

interface SidebarProps {
    currentUrl: string;
    userName: string;
    study?: any;
    form?: any;
    isPreview?: boolean;
    onSectionChange?: (id: string | number) => void;
    onFormChange?: (formId: string | number) => void; // AJOUTÉ
    activeSectionId?: string | number;
    onClosePreview?: () => void;
}

export function AppSidebarDynamic({ 
    currentUrl, 
    userName, 
    study, 
    form, 
    isPreview = false,
    onSectionChange,
    onFormChange, // AJOUTÉ
    activeSectionId,
    onClosePreview
}: SidebarProps) {
    const { props } = usePage();
    const auth = (props as any).auth;
    const userRole = auth?.user?.role || 'Utilisateur';
    const urlWithoutQuery = currentUrl.split('?')[0];

    // --- 1. MODE PREVIEW (Priorité) ---
    if (isPreview) {
        return (
            <SidebarNavPreview 
                form={form}
                activeSectionId={activeSectionId ?? (form?.sections?.[0]?.id || '')}
                onSectionChange={onSectionChange ?? (() => {})}
                onFormChange={onFormChange} // AJOUTÉ
                onBack={onClosePreview ?? (() => {})}
            />
        );
    }

    // --- 2. LOGIQUE DE NAVIGATION STANDARD ---
    if (urlWithoutQuery === '/studies' || urlWithoutQuery === '/dashboard') return null;

    const isAdminMode = urlWithoutQuery.startsWith('/admin');
    const isUserSettingsMode = urlWithoutQuery.startsWith('/settings');
    const isBuilderMode = urlWithoutQuery.includes('/builder/');
    const isStudyContextMode = urlWithoutQuery.startsWith('/studies/') && 
                               urlWithoutQuery !== '/studies' && 
                               !isBuilderMode;

    if (isBuilderMode) {
        return (
            <SidebarNavBuilder 
                form={form} 
                userName={userName} 
                userRole={userRole} 
                currentUrl={currentUrl}
            />
        );
    }
    
    return (
        <aside className="w-64 h-full bg-white flex flex-col overflow-hidden border-r border-zinc-200">
            <div className="flex-none">
                <SidebarHeader mode={isAdminMode ? 'admin' : isUserSettingsMode ? 'settings' : 'app'} />
                {!isAdminMode && !isUserSettingsMode && <SidebarStudySelect />}
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
                {isAdminMode && <SidebarNavAdmin currentUrl={currentUrl} />}
                {isUserSettingsMode && <SidebarNavSettings currentUrl={currentUrl} />}
                {isStudyContextMode && <SidebarNavStudy currentUrl={currentUrl} />}
                {!isStudyContextMode && !isAdminMode && !isUserSettingsMode && <SidebarNavMain currentUrl={currentUrl} />}
            </nav>

            <div className="flex-none pt-4">
                <SidebarUserFooter userName={userName} userRole={userRole} />
            </div>
        </aside>
    );
}