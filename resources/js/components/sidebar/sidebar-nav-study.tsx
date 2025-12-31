import React, { useState } from 'react';
import { 
    Users, ChevronUp, LayoutDashboard, 
    ClipboardList, CheckSquare, Hammer,
    BarChart3, History
} from 'lucide-react';
import { MenuButton } from './menu-button';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export function SidebarNavStudy({ currentUrl }: { currentUrl: string }) {
    const { props } = usePage();
    
    // On récupère l'étude active (soit via le contrôleur Study, soit via les props partagées)
    const study = (props as any).study || (props as any).activeStudy;
    
    // On utilise le protocol_code pour les URLs comme demandé (ex: /studies/DZ-CAVUM-2025)
    const studySlug = study?.protocol_code;

    const [openSections, setOpenSections] = useState({
        ecrf: true,
        etude: true
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const menuVariants: Variants = {
        open: { 
            height: "auto", 
            opacity: 1, 
            display: "block",
            transition: { 
                height: { duration: 0.4, ease: "easeInOut" },
                opacity: { duration: 0.3, delay: 0.1 }
            } 
        },
        collapsed: { 
            height: 0, 
            opacity: 0, 
            transitionEnd: { display: "none" },
            transition: { 
                height: { duration: 0.4, ease: "easeInOut" },
                opacity: { duration: 0.2 }
            } 
        }
    };

    // Si aucune étude n'est chargée, on n'affiche rien
    if (!studySlug) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Section eCRF */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between px-0 mb-2">
                    <h3 className="text-[10px] font-black tracking-[0.15em] text-muted-foreground uppercase ml-2">Configuration</h3>
                    <button onClick={() => toggleSection('ecrf')} className="hover:bg-accent rounded-md p-1 transition-colors">
                        <ChevronUp size={14} className={`transition-transform duration-500 ${!openSections.ecrf ? "rotate-180" : ""}`} />
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {openSections.ecrf && (
                        <motion.div initial="collapsed" animate="open" exit="collapsed" variants={menuVariants} className="overflow-hidden">
                            <div className="flex flex-col gap-1">
                                {/* Tableau de bord -> redirige vers show.tsx de l'étude */}
                                <MenuButton 
                                    href={`/studies/${studySlug}`} 
                                    icon={LayoutDashboard} 
                                    label="Tableau de bord" 
                                    active={currentUrl === `/studies/${studySlug}`} 
                                />
                                
                                {/* Construction eCRF -> redirige vers Builder.tsx */}
                                <MenuButton 
                                    href={`/studies/${studySlug}/builder`} 
                                    icon={Hammer} 
                                    label="Construction eCRF" 
                                    active={currentUrl.includes('/builder')} 
                                />
                                
                                <MenuButton 
                                    href={`/studies/${studySlug}/monitoring`} 
                                    icon={CheckSquare} 
                                    label="Monitoring" 
                                    active={currentUrl.includes('/monitoring')} 
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Section Gestion Étude */}
            <div className="flex flex-col border-t border-border/50 pt-4">
                <div className="flex items-center justify-between px-0 mb-2">
                    <h3 className="text-[10px] font-black tracking-[0.15em] text-muted-foreground uppercase ml-2">Données & Suivi</h3>
                    <button onClick={() => toggleSection('etude')} className="hover:bg-accent rounded-md p-1 transition-colors">
                        <ChevronUp size={14} className={`transition-transform duration-500 ${!openSections.etude ? "rotate-180" : ""}`} />
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {openSections.etude && (
                        <motion.div initial="collapsed" animate="open" exit="collapsed" variants={menuVariants} className="overflow-hidden">
                            <div className="flex flex-col gap-1">
                                <MenuButton 
                                    href={`/studies/${studySlug}/patients`} 
                                    icon={Users} 
                                    label="Sujets" 
                                    active={currentUrl.includes('/patients')} 
                                />
                                <MenuButton 
                                    href={`/studies/${studySlug}/analytics`} 
                                    icon={BarChart3} 
                                    label="Analytique" 
                                    active={currentUrl.includes('/analytics')} 
                                />
                                <MenuButton 
                                    href={`/studies/${studySlug}/audit`} 
                                    icon={History} 
                                    label="Audit Trail" 
                                    active={currentUrl.includes('/audit')} 
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}