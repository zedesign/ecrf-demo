import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout'; 
import { 
    X, ChevronLeft, ChevronRight, Eye, MessageSquareText, Search,
    Calendar as CalendarIcon, AlertCircle, CheckCircle2, Type, 
    Hash, AlignLeft, List, CheckSquare, Clock, ChevronDown, 
    Check, ImageIcon, CalendarClock, MoreHorizontal, Info
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Composants SHADCN
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Tes Renderers personnalisés
import DateRenderer from './components/Tabs/Renderers/DateRenderer';
import TextRenderer from './components/Tabs/Renderers/TextRenderer';
import { SelectionRenderer } from './components/Tabs/Renderers/SelectRenderer';
import { NumberRenderer } from './components/Tabs/Renderers/NumberRendrer';

interface FormPreviewProps {
    form: any;
    onClose: () => void;
}

const FIELD_ICONS: Record<string, any> = {
    text: Type,
    number: Hash,
    textarea: AlignLeft,
    select: List,
    radio: CheckCircle2,
    checkbox: CheckSquare,
    date: CalendarIcon,
    time: Clock,
};

export const FormPreview = ({ form: initialForm, onClose }: FormPreviewProps) => {
    const { props } = usePage();
    
    // --- ÉTATS ---
    const [currentForm, setCurrentForm] = useState(initialForm);
    const [activeSectionId, setActiveSectionId] = useState<string | number>(currentForm.sections?.[0]?.id || '');
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Fonction de mise à jour synchronisée avec tes Renderers
    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ 
            ...prev, 
            [fieldId]: value 
        }));
    };

    // --- LOGIQUE NAVIGATION ---
    const sortedSections = useMemo(() => {
        const sections = [...(currentForm.sections || [])];
        return sections.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    }, [currentForm]);

    const currentIndex = sortedSections.findIndex(s => s.id === activeSectionId);
    const currentSection = sortedSections[currentIndex] || sortedSections[0];
    const completionPercentage = 45; 

    // --- MOTEUR DE RENDU (RENDER ENGINE) ---
    const renderInput = (field: any) => {
        const baseInputClass = "w-full rounded-xl border-zinc-200 bg-white focus:ring-[#0891b2]/10 focus:border-[#0891b2] transition-all shadow-sm font-medium text-zinc-600 placeholder:text-zinc-400 placeholder:font-normal";

        switch (field.type) {
            case 'text':
                return (
                    <TextRenderer 
                        field={field} 
                        value={formData[field.id] || ''} 
                        onChange={handleFieldChange} 
                    />
                );

            case 'number':
                return (
                    <NumberRenderer
                        field={field}
                        value={formData[field.id] || ''}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        // On passe undefined pour l'instant si tu n'as pas de state "errors"
                        error={undefined} 
                    />
                );

            // On regroupe les 3 types de sélection ici
            case 'select':
            case 'radio':
            case 'checkbox':
                return (
                    <SelectionRenderer 
                        field={field} 
                        value={formData[field.id]} 
                        onChange={handleFieldChange} 
                    />
                );

            case 'date':
                return (
                    <DateRenderer 
                        field={field} 
                        value={formData[field.id]} 
                        onChange={handleFieldChange} 
                    />
                );

            default:
                return <Input placeholder="Type non géré" className="h-12 w-full" disabled />;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col h-screen overflow-hidden">
            <AppLayout 
                form={currentForm} 
                isPreviewMode={true} 
                activeSectionId={activeSectionId}
                onSectionChange={(id) => setActiveSectionId(id)}
                onClosePreview={onClose}
            >
                <header className="h-20 w-full bg-[#f8fafc] px-10 flex justify-between items-center shrink-0 border-b border-zinc-100/50">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500 uppercase">
                            <span>Statut:</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-dark-cyan-600"></div>
                                <span className="text-zinc-900 font-bold tracking-tight">En cours</span>
                            </div>
                        </div>
                        <div className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">
                            ID du sujet: <span className="text-zinc-900 font-bold ml-1">CENTER1-D0001</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-11 px-4 flex items-center gap-2 bg-cyan-50 text-[#0891b2] rounded-xl font-black text-[10px] uppercase tracking-widest border border-cyan-100">
                            <Eye size={18} /> Mode Preview
                        </div>
                        <button onClick={onClose} className="h-11 w-11 flex items-center justify-center bg-white text-zinc-400 rounded-xl border border-zinc-200 shadow-sm hover:text-zinc-900 transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
                    <main className="flex-1 overflow-y-auto px-10 pt-8 pb-10 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-100 overflow-hidden">
                                <div className="px-10 py-8 border-b border-zinc-50 bg-white">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Baseline</p>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">{currentSection?.title}</h1>
                                                <span className="px-2 py-0.5 bg-cyan-50 text-dark-cyan-700 text-[10px] font-bold rounded-full border border-cyan-100">{completionPercentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                                            <span>Progression du formulaire</span>
                                            <span>{completionPercentage}% Complété</span>
                                        </div>
                                        <div className="relative h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="absolute top-0 left-0 h-full bg-dark-cyan-600 transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 min-h-[500px]">
                                    <div className="space-y-10">
                                        {(currentSection?.rows || []).map((row: any) => (
                                            <div key={row.id} className={cn("grid gap-8 items-start", row.columns === 2 ? "md:grid-cols-2" : row.columns === 3 ? "md:grid-cols-3" : "grid-cols-1")}>
                                                {row.fields.map((field: any) => {
                                                    const Icon = FIELD_ICONS[field.type] || Type;
                                                    return (
                                                        <div key={field.id} className="group relative">
                                                            <div className="mb-3">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-2">
                                                                        <Label className="text-[13px] font-bold text-[#1e293b] flex items-center gap-2 uppercase tracking-tight">
                                                                            <Icon size={14} className="text-dark-cyan-700" />
                                                                            {field.label || "Sans titre"}
                                                                            {field.required && <span className="text-red-600 font-bold ml-0.5">*</span>}
                                                                        </Label>
                                                                        {field.helpImageUrl && (
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <button className="p-1 bg-cyan-50 text-[#0891b2] rounded-md"><ImageIcon size={12} /></button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="p-0 border-none bg-white shadow-2xl rounded-xl overflow-hidden max-w-[250px]">
                                                                                        <img src={field.helpImageUrl} alt="Aide" className="w-full h-auto" />
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        )}
                                                                    </div>
                                                                    <button className="p-1.5 bg-zinc-100 rounded-md text-zinc-400 group-hover:bg-slate-200 transition"><MoreHorizontal size={14} /></button>
                                                                </div>
                                                                {field.description && (
                                                                    <p className="mt-1 text-[11px] font-medium text-zinc-400 uppercase tracking-tight leading-relaxed">{field.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="w-full">{renderInput(field)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => currentIndex > 0 && setActiveSectionId(sortedSections[currentIndex-1].id)} 
                                    disabled={currentIndex <= 0} 
                                    className="flex items-center justify-center gap-3 px-6 py-5 bg-white border border-zinc-200 rounded-3xl text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:text-zinc-900 transition-all shadow-sm disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} /> Précédent
                                </button>
                                <button 
                                    onClick={() => currentIndex < sortedSections.length - 1 && setActiveSectionId(sortedSections[currentIndex+1].id)} 
                                    disabled={currentIndex >= sortedSections.length - 1} 
                                    className="flex items-center justify-center gap-3 px-6 py-5 bg-white border border-zinc-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-zinc-900 transition-all shadow-sm disabled:opacity-30"
                                >
                                    Suivant <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </main>

                    <aside className="w-[400px] bg-white border-l border-zinc-200 hidden xl:flex flex-col shrink-0 shadow-[-4px_0_20_rgba(0,0,0,0.02)]">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><MessageSquareText size={20} /></div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight text-zinc-900">Queries & Révisions</p>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">0 Message</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-6 border-2 border-dashed border-zinc-200/50"><Search size={28} /></div>
                            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-tighter mb-2">Historique vide</h3>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-bold max-w-[200px] uppercase">Sélectionnez un champ pour poser une question.</p>
                        </div>
                    </aside>
                </div>
            </AppLayout>
        </div>
    );
};