    import React, { useMemo } from 'react';
    import { usePage } from '@inertiajs/react';
    import { BookOpen, ArrowLeft, CheckCircle2, Check } from 'lucide-react';
    import { SidebarUserFooter } from './sidebar-user-footer';
    import { cn } from "@/lib/utils";

    interface SidebarNavPreviewProps {
        form: any; 
        activeSectionId: string | number;
        onSectionChange: (id: string | number) => void;
        onFormChange?: (id: string | number) => void;
        onBack: () => void;
    }

    export function SidebarNavPreview({ form, activeSectionId, onSectionChange, onFormChange, onBack }: SidebarNavPreviewProps) {
        const { props } = usePage();
        
        const allForms = (props as any).studyForms || [];
        const currentStudy = (props as any).study;
        const auth = (props as any).auth;
        // Les réponses réelles (sera vide au début, puis se remplira)
        const submissions = (props as any).submissions || {};

        // 1. Tri et Organisation des données
        const allFormsSorted = useMemo(() => {
            return [...allForms]
                .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
                .map(f => ({
                    ...f,
                    sections: [...(f.sections || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
                }));
        }, [allForms]);

        /**
         * LOGIQUE DE CALCUL RÉELLE
         */
        
        // Calcul du pourcentage pour une section précise (Cercle à droite)
        const getSectionProgress = (section: any) => {
            const fields = section.fields || [];
            if (fields.length === 0) return 0;
            
            const answeredCount = fields.filter((f: any) => 
                submissions[f.id] !== undefined && submissions[f.id] !== null && submissions[f.id] !== ''
            ).length;

            return Math.round((answeredCount / fields.length) * 100);
        };

        // Calcul du pourcentage pour une Visite entière (Le badge sous le titre)
        const getVisitProgress = (visit: any) => {
            const sections = visit.sections || [];
            if (sections.length === 0) return 0;

            const totalProgress = sections.reduce((acc: number, s: any) => acc + getSectionProgress(s), 0);
            return Math.round(totalProgress / sections.length);
        };

        // Calcul Global (Barre du haut)
        const globalProgress = useMemo(() => {
            if (allFormsSorted.length === 0) return 0;
            const total = allFormsSorted.reduce((acc, f) => acc + getVisitProgress(f), 0);
            return Math.round(total / allFormsSorted.length);
        }, [allFormsSorted, submissions]);

        return (
            <aside className="w-64 h-full bg-white flex flex-col overflow-hidden border-r border-zinc-200">
                {/* Header & Global Progress */}
                <div className="flex-none bg-zinc-50/50 border-b border-zinc-100">
                    <div className="px-6 pt-6 pb-2">
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors text-sm font-bold group cursor-pointer"
                        >
                            <div className="h-8 w-8 bg-white shadow-sm rounded-full flex items-center justify-center group-hover:bg-zinc-100 transition-all border border-zinc-100">
                                <ArrowLeft size={14} />
                            </div>
                            Quitter l'aperçu
                        </button>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-dark-cyan-600 rounded-xl shadow-lg shadow-cyan-900/10 flex items-center justify-center shrink-0">
                                <BookOpen size={18} className="text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                    {currentStudy?.protocol_code || 'STUDY-001'}
                                </span>
                                <span className="text-sm font-black text-zinc-900 truncate tracking-tight uppercase">Mode Patient</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Progression eCRF</span>
                                <span className="text-[11px] font-black text-dark-cyan-600">{globalProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-dark-cyan-600 transition-all duration-700 ease-in-out" 
                                    style={{ width: `${globalProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation complète */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto mt-6 custom-scrollbar">
                    <div className="flex flex-col space-y-8">
                        {allFormsSorted.map((f: any) => {
                            const isSelectedForm = form?.id === f.id;
                            const visitProgress = getVisitProgress(f);

                            return (
                                <div key={f.id} className="flex flex-col">
                                    <div className="px-4 mb-3 space-y-1">
                                        <button 
                                            onClick={() => onFormChange?.(f.id)}
                                            className={cn(
                                                "text-sm font-black uppercase tracking-tight text-left transition-all block w-full",
                                                isSelectedForm ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                            )}
                                        >
                                            {f.title}
                                        </button>
                                        
                                        {/* Style de badge conservé comme demandé */}
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                                                visitProgress === 100 
                                                    ? "bg-emerald-50 text-emerald-600" 
                                                    : visitProgress > 0 
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-zinc-100 text-zinc-400"
                                            )}>
                                                {visitProgress === 100 ? (
                                                    <CheckCircle2 size={10} />
                                                ) : (
                                                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", visitProgress > 0 ? "bg-amber-500" : "bg-zinc-300")} />
                                                )}
                                                {visitProgress}% {visitProgress === 100 ? 'Terminé' : visitProgress > 0 ? 'En cours' : 'À saisir'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative space-y-0.5 mt-1">
                                        {isSelectedForm && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-dark-cyan-700/20 rounded-full" />
                                        )}

                                        {f.sections?.map((section: any) => {
                                            const isSectionActive = isSelectedForm && String(section.id) === String(activeSectionId);
                                            const sectionProgress = getSectionProgress(section);
                                            const isCompleted = sectionProgress === 100;
                                            
                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => {
                                                        if (!isSelectedForm) onFormChange?.(f.id);
                                                        onSectionChange(section.id);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between pl-6 pr-4 py-2 text-left transition-all group relative",
                                                        isSectionActive ? "bg-cyan-50/30" : "hover:bg-zinc-50/50"
                                                    )}
                                                >
                                                    {isSectionActive && (
                                                        <div className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-dark-cyan-600 rounded-full shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
                                                    )}
                                                    
                                                    <span className={cn(
                                                        "text-xs transition-all pr-2 truncate",
                                                        isSectionActive 
                                                            ? "text-dark-cyan-600 font-bold" 
                                                            : "text-zinc-500 font-normal group-hover:text-zinc-800"
                                                    )}>
                                                        {section.title}
                                                    </span>

                                                    {/* Cercle de progression à droite */}
                                                    <div className="flex-shrink-0 relative h-4 w-4 flex items-center justify-center">
                                                        {isCompleted ? (
                                                            <div className="bg-emerald-500 rounded-full p-0.5 text-white animate-in zoom-in duration-300">
                                                                <Check size={10} strokeWidth={4} />
                                                            </div>
                                                        ) : (
                                                            <svg className="h-full w-full transform -rotate-90">
                                                                <circle
                                                                    cx="8"
                                                                    cy="8"
                                                                    r="6"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    fill="transparent"
                                                                    className="text-zinc-100"
                                                                />
                                                                <circle
                                                                    cx="8"
                                                                    cy="8"
                                                                    r="6"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    fill="transparent"
                                                                    strokeDasharray={37.7}
                                                                    strokeDashoffset={37.7 - (37.7 * sectionProgress) / 100}
                                                                    strokeLinecap="round"
                                                                    className={cn(
                                                                        "transition-all duration-500",
                                                                        sectionProgress > 0 ? "text-dark-cyan-600" : "text-zinc-200"
                                                                    )}
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </nav>

                <div className="flex-none pt-4">
                    <SidebarUserFooter userName={auth.user.name} userRole={auth.user.role} />
                </div>
            </aside>
        );
    }