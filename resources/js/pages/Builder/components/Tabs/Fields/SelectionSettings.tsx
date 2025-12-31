import React, { useEffect, useState } from 'react';
import { 
    Plus, Trash2, Settings2, ChevronUp, ChevronDown, 
    Layout, Info, ListPlus, ShieldCheck, Asterisk 
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SelectionSettingsProps {
    field: any;
    onUpdate: (updates: any) => void;
}

export const SelectionSettings = ({ field, onUpdate }: SelectionSettingsProps) => {
    
    // Détermination des valeurs initiales (sécurité multi-niveaux)
    const getInitialValue = (key: string, defaultValue: any) => {
        if (field[key] !== undefined) return field[key];
        if (field.settings && field.settings[key] !== undefined) return field.settings[key];
        return defaultValue;
    };

    // État local pour garantir une réactivité fluide sans attendre le retour serveur
    const [options, setOptions] = useState(field.options || field.settings?.options || []);
    const [layout, setLayout] = useState(getInitialValue('layout', 'vertical'));
    const [sensitive, setSensitive] = useState(getInitialValue('sensitive', false));
    const [required, setRequired] = useState(getInitialValue('required', false));

    // Synchronisation si le champ change (ex: passage d'une question à une autre)
    useEffect(() => {
        setOptions(field.options || field.settings?.options || []);
        setLayout(getInitialValue('layout', 'vertical'));
        setSensitive(getInitialValue('sensitive', false));
        setRequired(getInitialValue('required', false));
    }, [field.id]);

    // FONCTION DE MISE À JOUR UNIQUE (La clé du problème est ici)
    const emitUpdate = (newValues: any) => {
        const updatedData = {
            options,
            layout,
            sensitive,
            required,
            ...newValues // On écrase avec la nouvelle modif
        };

        // On envoie à la racine ET dans settings pour qu'aucun script ne les perde
        onUpdate({
            ...updatedData,
            settings: {
                ...(field.settings || {}),
                ...updatedData
            }
        });
    };

    const handleAddOption = () => {
        const newOptions = [...options, { label: '', value: '' }];
        setOptions(newOptions);
        emitUpdate({ options: newOptions });
    };

    const handleUpdateOption = (index: number, key: 'label' | 'value', val: string) => {
        const newOptions = [...options];
        let finalValue = val ?? '';
        if (key === 'value') finalValue = finalValue.toUpperCase().replace(/\s+/g, '_');
        newOptions[index] = { ...newOptions[index], [key]: finalValue };
        setOptions(newOptions);
        emitUpdate({ options: newOptions });
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = options.filter((_: any, i: number) => i !== index);
        setOptions(newOptions);
        emitUpdate({ options: newOptions });
    };

    const moveOption = (index: number, direction: 'up' | 'down') => {
        const newOptions = [...options];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOptions.length) return;
        [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
        setOptions(newOptions);
        emitUpdate({ options: newOptions });
    };

    const isSelect = field.type === 'select';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="flex flex-wrap items-start gap-8">
                {/* 1. PROPRIÉTÉS DU CHAMP */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <ShieldCheck size={14} className="text-dark-cyan-700" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Propriétés du champ
                        </label>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        {/* REQUIS */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Réponse requise</span>
                            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                                <button
                                    type="button"
                                    onClick={() => { setRequired(true); emitUpdate({ required: true }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                        required ? "bg-white text-dark-cyan-700 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    <Asterisk size={10} strokeWidth={3} /> Oui
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setRequired(false); emitUpdate({ required: false }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        !required ? "bg-white text-zinc-500 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    Non
                                </button>
                            </div>
                        </div>

                        {/* DONNÉE SENSIBLE - OPTION 1 */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Donnée Sensible</span>
                            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                                <button
                                    type="button"
                                    onClick={() => { setSensitive(true); emitUpdate({ sensitive: true }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                        sensitive ? "bg-dark-cyan-600 text-white shadow-sm shadow-cyan-200" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    <ShieldCheck size={10} strokeWidth={3} /> Activé
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSensitive(false); emitUpdate({ sensitive: false }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        !sensitive ? "bg-white text-zinc-500 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    Désactivé
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ALIGNEMENT - OPTION 2 */}
                {!isSelect && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Layout size={14} className="text-dark-cyan-700" />
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Disposition
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                             <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Alignement</span>
                            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                                {[
                                    { id: 'vertical', label: 'Vertical' },
                                    { id: 'horizontal', label: 'Horizontal' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => { setLayout(mode.id); emitUpdate({ layout: mode.id }); }}
                                        className={cn(
                                            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                            layout === mode.id 
                                                ? "bg-white text-dark-cyan-700 shadow-sm" 
                                                : "text-zinc-400 hover:text-zinc-500"
                                        )}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {sensitive && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 animate-in slide-in-from-top-1">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-medium text-amber-600 uppercase tracking-tight">
                        Cette donnée sera chiffrée en base de données.
                    </p>
                </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* OPTIONS DE RÉPONSE */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Settings2 size={14} className="text-dark-cyan-700" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Options de réponse
                        </label>
                    </div>
                    {options.length > 0 && (
                        <button 
                            type="button"
                            onClick={handleAddOption}
                            className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-xl hover:border-dark-cyan-600 transition-all shadow-sm"
                        >
                            <Plus size={12} /> Ajouter
                        </button>
                    )}
                </div>

                {options.length === 0 ? (
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="w-full py-12 border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-zinc-400 hover:bg-cyan-50/30 transition-all group"
                    >
                        <ListPlus size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Créer les options</span>
                    </button>
                ) : (
                    <div className="space-y-3">
                        {options.map((option: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-left-2">
                                <div className="flex flex-col">
                                    <button type="button" onClick={() => moveOption(index, 'up')} disabled={index === 0} className="p-1 text-zinc-300 hover:text-dark-cyan-700 disabled:opacity-10"><ChevronUp size={14} strokeWidth={3} /></button>
                                    <button type="button" onClick={() => moveOption(index, 'down')} disabled={index === options.length - 1} className="p-1 text-zinc-300 hover:text-dark-cyan-700 disabled:opacity-10"><ChevronDown size={14} strokeWidth={3} /></button>
                                </div>
                                <div className="flex-[2] relative">
                                    <input
                                        type="text"
                                        value={option.label ?? ''}
                                        onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                                        className="w-full bg-zinc-50 border border-transparent focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 py-3 text-sm font-bold outline-none shadow-sm"
                                        placeholder="Label..."
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={option.value ?? ''}
                                        onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                                        className="w-full bg-zinc-100 border border-transparent focus:border-dark-cyan-600 focus:bg-white rounded-2xl px-4 py-3 text-[10px] font-black outline-none uppercase text-zinc-500"
                                        placeholder="VALEUR"
                                    />
                                </div>
                                <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};