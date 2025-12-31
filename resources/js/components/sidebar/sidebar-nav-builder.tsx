import React, { useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { SidebarUserFooter } from './sidebar-user-footer';
import { cn } from "@/lib/utils";

interface SidebarNavBuilderProps {
    form: any;
    userName: string;
    userRole: string;
    currentUrl: string;
}

export function SidebarNavBuilder({ form, userName, userRole }: SidebarNavBuilderProps) {
    const { props } = usePage();
    
    // 1. Récupération des données depuis Inertia
    // On récupère 'study' que nous venons d'ajouter dans le contrôleur
    const currentStudy = (props as any).study;
    const rawForms = (props as any).studyForms || [];

    // 2. Logique de tri (Source unique de vérité pour la sidebar)
    const allFormsSorted = useMemo(() => {
        return [...rawForms]
            .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
            .map(f => ({
                ...f,
                sections: [...(f.sections || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
            }));
    }, [rawForms]);

    const handleNavigation = (fId: string, sectionId: string | null, isSelectedForm: boolean) => {
        if (isSelectedForm) {
            if (sectionId) {
                const event = new CustomEvent('toggle-section', { detail: { id: sectionId } });
                window.dispatchEvent(event);
                setTimeout(() => {
                    const element = document.getElementById(`section-${sectionId}`);
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Utilise l'UUID du formulaire pour la navigation entre formulaires
            router.visit(`/builder/forms/${fId}/edit`);
        }
    };

    /**
     * ACTION DE RETOUR :
     * Redirige vers /studies/[PROTOCOL_CODE]
     */
    const handleBack = () => {
        if (currentStudy?.protocol_code) {
            router.visit(`/studies/${currentStudy.protocol_code}`);
        } else {
            // Fallback si l'étude n'est pas trouvée
            router.visit('/studies');
        }
    };

    return (
        <aside className="w-64 h-full bg-white flex flex-col overflow-hidden border-r border-zinc-200">
            {/* Header spécifique Builder */}
            <div className="flex-none">
                <div className="px-6 pt-6 pb-2">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors text-sm font-bold group cursor-pointer"
                    >
                        <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-200 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        Retour
                    </button>
                </div>

                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 p-4 bg-zinc-50/50 rounded-[2rem] border border-zinc-100">
                        <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center shrink-0">
                            <BookOpen size={18} className="text-dark-cyan-800" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Étude active</span>
                            <span className="text-sm font-black text-zinc-900 truncate tracking-tight">
                                {currentStudy?.protocol_code || "Chargement..."}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation triée */}
            <nav className="flex-1 px-4 space-y-8 overflow-y-auto mt-4 custom-scrollbar">
                <div className="flex flex-col space-y-10">
                    {allFormsSorted.map((f: any) => {
                        const isSelectedForm = form?.id === f.id;
                        return (
                            <div key={f.id} className="flex flex-col">
                                <h3 
                                    onClick={() => handleNavigation(f.id, null, isSelectedForm)}
                                    className={cn(
                                        "px-4 mb-3 text-sm font-black uppercase tracking-tight transition-colors cursor-pointer hover:text-dark-cyan-700",
                                        isSelectedForm ? "text-dark-cyan-800" : "text-zinc-400"
                                    )}
                                >
                                    {f.title}
                                </h3>

                                <div className="relative space-y-0.5">
                                    {isSelectedForm && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#0891b2]/30 rounded-full" />
                                    )}

                                    {f.sections?.map((section: any) => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleNavigation(f.id, section.id, isSelectedForm)}
                                            className="w-full flex items-center justify-between pl-6 py-1.5 text-left transition-all group relative cursor-pointer"
                                        >
                                            <div className={cn(
                                                "absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100",
                                                isSelectedForm ? "bg-dark-cyan-700" : "bg-zinc-300"
                                            )} />
                                            
                                            <span className={cn(
                                                "text-xs transition-all",
                                                isSelectedForm 
                                                    ? "text-zinc-600 font-medium group-hover:text-dark-cyan-700" 
                                                    : "text-zinc-400 font-normal group-hover:text-zinc-600"
                                            )}>
                                                {section.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="flex-none pt-4">
                <SidebarUserFooter userName={userName} userRole={userRole} />
            </div>
        </aside>
    );
}