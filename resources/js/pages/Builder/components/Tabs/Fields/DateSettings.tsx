import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, Asterisk, Calendar, 
    Info, Clock, CalendarRange, CalendarDays, 
    CalendarClock, History, Ban, Check
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface DateSettingsProps {
    field: any;
    onUpdate: (updates: any) => void;
}

export const DateSettings = ({ field, onUpdate }: DateSettingsProps) => {
    
    // 1. Initialisation sécurisée
    const getInitialValue = (key: string, defaultValue: any) => {
        if (field[key] !== undefined) return field[key];
        if (field.settings && field.settings[key] !== undefined) return field.settings[key];
        return defaultValue;
    };

    // 2. État local
    const [dateFormat, setDateFormat] = useState(getInitialValue('dateFormat', 'date'));
    const [isRequired, setIsRequired] = useState(getInitialValue('required', false));
    const [isSensitive, setIsSensitive] = useState(getInitialValue('sensitive', false));
    const [disablePastDates, setDisablePastDates] = useState(getInitialValue('disablePastDates', false));

    // 3. Synchronisation
    useEffect(() => {
        setDateFormat(getInitialValue('dateFormat', 'date'));
        setIsRequired(getInitialValue('required', false));
        setIsSensitive(getInitialValue('sensitive', false));
        setDisablePastDates(getInitialValue('disablePastDates', false));
    }, [field.id]);

    // 4. Émission
    const emitUpdate = (newValues: any) => {
        const updatedData = {
            dateFormat,
            required: isRequired,
            sensitive: isSensitive,
            disablePastDates,
            ...newValues
        };

        onUpdate({
            ...updatedData,
            settings: {
                ...(field.settings || {}),
                ...updatedData
            }
        });
    };

    const formats = [
        { id: 'date', label: 'Date', desc: 'Jour, mois, année', icon: <CalendarDays size={16} /> },
        { id: 'time', label: 'Heure', desc: 'Heures et minutes uniquement', icon: <Clock size={16} /> },
        { id: 'datetime', label: 'Date & Heure', desc: 'Horodatage complet', icon: <CalendarClock size={16} /> },
        { id: 'year', label: 'Année', desc: 'Sélection de l\'année uniquement', icon: <span className="text-[10px] font-black">2025</span> },
        { id: 'month-year', label: 'Mois & Année', desc: 'Expiration ou période', icon: <CalendarRange size={16} /> },
        { id: 'partial', label: 'Date Partielle', desc: 'Permet une saisie incomplète', icon: <History size={16} /> },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* 1. TOP BAR : PROPRIÉTÉS & RESTRICTION */}
            <div className="flex flex-wrap items-start gap-12 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
                
                {/* BLOC PROPRIÉTÉS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ShieldCheck size={14} className="text-dark-cyan-700" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Propriétés du champ
                        </label>
                    </div>
                    
                    <div className="flex gap-6">
                        {/* REQUIS */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Réponse requise</span>
                            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                                <button
                                    type="button"
                                    onClick={() => { setIsRequired(true); emitUpdate({ required: true }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                        isRequired ? "bg-white text-dark-cyan-700 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    <Asterisk size={10} strokeWidth={3} /> Oui
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsRequired(false); emitUpdate({ required: false }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        !isRequired ? "bg-white text-zinc-500 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    Non
                                </button>
                            </div>
                        </div>

                        {/* SENSIBLE (HARMONISÉ) */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Donnée Sensible</span>
                            <div className="flex p-1 bg-white rounded-2xl w-fit border border-zinc-200/50 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => { setIsSensitive(true); emitUpdate({ sensitive: true }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                        isSensitive ? "bg-dark-cyan-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    <ShieldCheck size={10} strokeWidth={3} /> Activé
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsSensitive(false); emitUpdate({ sensitive: false }); }}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                        !isSensitive ? "bg-zinc-100 text-zinc-500" : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    Désactivé
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOC RESTRICTION */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Ban size={14} className="text-amber-500" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Restriction calendrier
                        </label>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Dates antérieures</span>
                        <div className="flex p-1 bg-white rounded-2xl w-fit border border-zinc-200/50 shadow-sm">
                            <button
                                type="button"
                                onClick={() => { setDisablePastDates(true); emitUpdate({ disablePastDates: true }); }}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    disablePastDates ? "bg-amber-500 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Bloquer
                            </button>
                            <button
                                type="button"
                                onClick={() => { setDisablePastDates(false); emitUpdate({ disablePastDates: false }); }}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    !disablePastDates ? "bg-zinc-100 text-zinc-500" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Autoriser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MESSAGE D'ALERTE SENSIBLE (STYLE HARMONISÉ) */}
            {isSensitive && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 animate-in slide-in-from-top-1 mx-1">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-medium text-amber-600 uppercase tracking-tight">
                        La donnée sera chiffrée en base de données pour ce champ date.
                    </p>
                </div>
            )}

            {/* 2. FORMAT DE SAISIE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Calendar size={14} className="text-dark-cyan-700" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Format de saisie
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formats.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => { setDateFormat(f.id); emitUpdate({ dateFormat: f.id }); }}
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group relative",
                                dateFormat === f.id 
                                    ? "bg-white border-dark-cyan-600 shadow-md ring-1 ring-[#0891b2]/10" 
                                    : "bg-zinc-50/30 border-zinc-100 hover:border-zinc-200 hover:bg-white"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                dateFormat === f.id ? "bg-dark-cyan-600 text-white rotate-3" : "bg-white text-zinc-400 border border-zinc-100 group-hover:scale-110"
                            )}>
                                {f.icon}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className={cn(
                                    "text-[11px] font-black uppercase tracking-widest",
                                    dateFormat === f.id ? "text-dark-cyan-600" : "text-zinc-600"
                                )}>
                                    {f.label}
                                </div>
                                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight mt-0.5">
                                    {f.desc}
                                </div>
                            </div>
                            {dateFormat === f.id && (
                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-dark-cyan-600 flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
                                    <Check size={10} className="text-white" strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RECAP */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#0891b2]/5 rounded-2xl border border-[#0891b2]/10">
                <Info size={16} className="text-dark-cyan-700 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-dark-cyan-700">
                    Configuration active : {formats.find(f => f.id === dateFormat)?.label}
                    {disablePastDates && " • Dates passées verrouillées"}
                </p>
            </div>
        </div>
    );
};