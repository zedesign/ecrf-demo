import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronUp, Trash2, Copy, Save, AlertCircle, RotateCcw, Check
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { TabModifier } from './Tabs/TabModifier';
import { TabConditions } from './Tabs/TabConditions';
import { TabValidation } from './Tabs/TabValidation';

interface QuestionEditorBlockProps {
    field: any;
    icon: any; 
    onUpdate: (updates: any) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onSave?: (field: any) => void;
    isCompact?: boolean;
}

export const QuestionEditorBlock = ({ 
    field, 
    icon: Icon, 
    onUpdate, 
    onDelete, 
    onDuplicate,
    onSave,
    isCompact 
}: QuestionEditorBlockProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('modifier');
    const [syncTick, setSyncTick] = useState(0);

    const normalize = (f: any) => {
        if (!f) return "";
        return JSON.stringify({
            name: (f.name || "").toUpperCase().replace(/\s+/g, '_'),
            label: f.label || "",
            type: f.type,
            required: !!f.required,
            options: f.options || [],
            settings: f.settings || {}
        });
    };

    const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(normalize(field));

    useEffect(() => {
        const handleGlobalSuccess = () => {
            setLastSavedSnapshot(normalize(field));
            setSyncTick(prev => prev + 1);
        };
        window.addEventListener('form-saved-success', handleGlobalSuccess);
        return () => window.removeEventListener('form-saved-success', handleGlobalSuccess);
    }, [field]);

    const hasChanges = useMemo(() => normalize(field) !== lastSavedSnapshot, [field, lastSavedSnapshot, syncTick]);
    const isTempId = typeof field.id === 'string' && field.id.includes('new');

    const handleSaveInternal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Empêche l'enroulement du bandeau parent
        
        if (onSave) {
            onSave(field);
            // On simule le passage au gris immédiatement pour le feedback visuel
            setTimeout(() => {
                setLastSavedSnapshot(normalize(field));
                setSyncTick(t => t + 1);
            }, 200);
        }
    };

    return (
        <div className={cn(
            "group transition-all duration-300 rounded-xl overflow-hidden mb-4",
            isExpanded ? "bg-white border-zinc-200 shadow-xl border-t-4 border-t-dark-cyan-600" : "bg-white border border-zinc-100 hover:border-zinc-300 shadow-sm"
        )}>
            <div 
                className={cn("flex items-center justify-between px-6 py-4 cursor-pointer select-none", isExpanded && "border-b border-zinc-100 bg-zinc-50/30", isCompact && "px-4 py-3")}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="text-dark-cyan-700" />}
                        <span className="text-[13px] font-black uppercase tracking-tight text-zinc-900">
                            {isExpanded ? "Modifier la question" : field.label || "Sans titre"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && !isTempId && <RotateCcw size={12} className="text-amber-500 animate-spin-slow" />}

                    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300", (hasChanges || isTempId) ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm" : "bg-zinc-100 border-zinc-200 text-zinc-400")}>
                        {(hasChanges || isTempId) && <AlertCircle size={10} className={cn(isTempId && "animate-pulse")} />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">Var: {field.name || 'À DÉFINIR'}</span>
                    </div>

                    <div className="flex items-center gap-1 border-l pl-3 border-zinc-100">
                        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Copy size={16} /></button>
                        
                        {isExpanded && (
                            <button 
                                type="button"
                                onClick={handleSaveInternal}
                                className={cn(
                                    "ml-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm border",
                                    (hasChanges || isTempId) ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600" : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default"
                                )}
                            >
                                {(hasChanges || isTempId) ? <><Save size={14} /> {!isCompact && "Enregistrer"}</> : <><Check size={14} /> {!isCompact && "Sauvegardé"}</>}
                            </button>
                        )}
                        <ChevronUp size={18} className={cn("ml-2 transition-transform duration-300", isExpanded ? "text-dark-cyan-700" : "text-zinc-300 rotate-180")} />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="bg-white">
                    <div className="flex border-b border-zinc-100 px-6 bg-zinc-50/50">
                        {['Modifier', 'Conditions', 'Validation'].map((tab) => (
                            <button key={tab} type="button" onClick={() => setActiveTab(tab.toLowerCase())} className={cn("px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 relative top-[1px]", activeTab === tab.toLowerCase() ? "border-dark-cyan-600 text-dark-cyan-600" : "border-transparent text-zinc-400 hover:text-zinc-600")}>{tab}</button>
                        ))}
                    </div>
                    <div className="p-8">
                        {activeTab === 'modifier' && <TabModifier field={field} onUpdate={onUpdate} />}
                        {activeTab === 'conditions' && <TabConditions />}
                        {activeTab === 'validation' && <TabValidation />}
                    </div>
                </div>
            )}
        </div>
    );
};