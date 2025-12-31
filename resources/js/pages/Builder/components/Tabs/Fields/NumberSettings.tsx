import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Asterisk, Binary, 
    Info, ChevronUp, ChevronDown, 
    Search, Check, Settings2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface NumberSettingsProps {
    field: any;
    onUpdate: (updates: any) => void;
}

const UNITS = [
    "µg", "mg", "g", "kg", "t",
    "µL", "mL", "cL", "L", "cm³", "m³",
    "mg/L", "g/L", "mg/mL", "µg/mL", "mmol/L", "mol/L", "%", "ppm",
    "mm", "cm", "m", "km",
    "mm²", "cm²", "m²",
    "ms", "s", "min", "h", "j", "sem", "mois", "an",
    "°C", "K", "°F",
    "mmHg", "Pa", "kPa", "bar",
    "bpm", "Hz", "resp/min",
    "J", "kJ", "cal", "kcal",
    "ratio", "score", "index", "raw",
    "UI", "mEq/L", "U/L"
];

export const NumberSettings = ({ field, onUpdate }: NumberSettingsProps) => {
    const getInitialValue = (key: string, defaultValue: any) => {
        if (field[key] !== undefined) return field[key];
        if (field.settings && field.settings[key] !== undefined) return field.settings[key];
        return defaultValue;
    };

    const [unitSearch, setUnitSearch] = useState("");
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    
    const [isRequired, setIsRequired] = useState(getInitialValue('required', false));
    const [isSensitive, setIsSensitive] = useState(getInitialValue('sensitive', false));
    const [minValue, setMinValue] = useState(getInitialValue('minValue', ''));
    const [maxValue, setMaxValue] = useState(getInitialValue('maxValue', ''));
    const [allowDecimals, setAllowDecimals] = useState(getInitialValue('allowDecimals', false));
    const [decimalPlaces, setDecimalPlaces] = useState(getInitialValue('decimalPlaces', 2));
    const [unit, setUnit] = useState(getInitialValue('unit', ""));

    useEffect(() => {
        setIsRequired(getInitialValue('required', false));
        setIsSensitive(getInitialValue('sensitive', false));
        setMinValue(getInitialValue('minValue', ''));
        setMaxValue(getInitialValue('maxValue', ''));
        setAllowDecimals(getInitialValue('allowDecimals', false));
        setDecimalPlaces(getInitialValue('decimalPlaces', 2));
        setUnit(getInitialValue('unit', ""));
    }, [field.id]);

    const emitUpdate = (newValues: any) => {
        const updatedData = {
            required: isRequired,
            sensitive: isSensitive,
            minValue,
            maxValue,
            allowDecimals,
            decimalPlaces,
            unit,
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

    const filteredUnits = UNITS.filter(u => 
        u.toLowerCase().includes(unitSearch.toLowerCase())
    );

    const noSpinnersClassName = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* 1. PROPRIÉTÉS GÉNÉRALES */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <ShieldCheck size={14} className="text-dark-cyan-700" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Propriétés du champ
                    </label>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Réponse requise</span>
                        <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50 shadow-sm">
                            <button
                                type="button"
                                onClick={() => { setIsRequired(true); emitUpdate({ required: true }); }}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                    isRequired ? "bg-white text-dark-cyan-700 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Oui
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
                        <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50 shadow-sm">
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
                                    !isSensitive ? "bg-white text-zinc-500 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Désactivé
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ALERTE SENSIBLE */}
            {isSensitive && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 animate-in slide-in-from-top-1">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-medium text-amber-600 uppercase tracking-tight">
                        La donnée sera chiffrée en base de données pour ce champ numérique.
                    </p>
                </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* 2. CONFIGURATION NUMÉRIQUE & UNITÉ */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Binary size={14} className="text-dark-cyan-700" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Configuration Numérique & Unité
                    </label>
                </div>

                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Type de nombre</span>
                        <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                            <button
                                type="button"
                                onClick={() => { setAllowDecimals(false); emitUpdate({ allowDecimals: false }); }}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    !allowDecimals ? "bg-white text-dark-cyan-700 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Entier
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAllowDecimals(true); emitUpdate({ allowDecimals: true }); }}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    allowDecimals ? "bg-white text-dark-cyan-700 shadow-sm" : "text-zinc-400 hover:text-zinc-500"
                                )}
                            >
                                Décimal
                            </button>
                        </div>
                    </div>

                    {/* Unité de mesure */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">Unité</span>
                        <Popover open={isUnitOpen} onOpenChange={setIsUnitOpen}>
                            <PopoverTrigger asChild>
                                <button className="h-11 min-w-[120px] bg-zinc-50 border border-zinc-200 rounded-2xl px-4 flex items-center justify-between group hover:border-dark-cyan-600 transition-all">
                                    <span className={cn("text-[11px] font-black uppercase tracking-widest", unit ? "text-dark-cyan-700" : "text-zinc-400")}>
                                        {unit || "Aucune"}
                                    </span>
                                    <ChevronDown size={14} className="text-zinc-400" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="p-0 w-[220px] rounded-2xl overflow-hidden border-zinc-100 shadow-2xl z-[100]">
                                <div className="p-2 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                                    <Search size={14} className="text-zinc-400" />
                                    <input 
                                        className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-tight w-full placeholder:text-zinc-300"
                                        placeholder="Rechercher..."
                                        value={unitSearch}
                                        onChange={(e) => setUnitSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1 bg-white">
                                    <button 
                                        onClick={() => { setUnit(""); emitUpdate({ unit: "" }); setIsUnitOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:bg-zinc-50 rounded-lg"
                                    >
                                        Pas d'unité
                                    </button>
                                    {filteredUnits.map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => { setUnit(u); emitUpdate({ unit: u }); setIsUnitOpen(false); }}
                                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:bg-cyan-50 hover:text-dark-cyan-600 rounded-lg transition-colors"
                                        >
                                            {u}
                                            {unit === u && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Décimales */}
                    {allowDecimals && (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-left-2 duration-300">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">Précision</span>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={decimalPlaces}
                                    onChange={(e) => { setDecimalPlaces(e.target.value); emitUpdate({ decimalPlaces: e.target.value }); }}
                                    className={cn("w-24 h-11 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 text-xs font-black transition-all outline-none text-zinc-700", noSpinnersClassName)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 uppercase pointer-events-none">Déc.</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
                            <ChevronDown size={10} /> Valeur Minimum
                        </label>
                        <input
                            type="number"
                            step={allowDecimals ? "0.01" : "1"}
                            value={minValue}
                            onChange={(e) => { setMinValue(e.target.value); emitUpdate({ minValue: e.target.value }); }}
                            placeholder="Min"
                            className={cn("w-full bg-zinc-50 border border-transparent focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 py-3 text-sm font-bold transition-all outline-none text-zinc-700 shadow-sm", noSpinnersClassName)}
                        />
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
                            <ChevronUp size={10} /> Valeur Maximum
                        </label>
                        <input
                            type="number"
                            step={allowDecimals ? "0.01" : "1"}
                            value={maxValue}
                            onChange={(e) => { setMaxValue(e.target.value); emitUpdate({ maxValue: e.target.value }); }}
                            placeholder="Max"
                            className={cn("w-full bg-zinc-50 border border-transparent focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 py-3 text-sm font-bold transition-all outline-none text-zinc-700 shadow-sm", noSpinnersClassName)}
                        />
                    </div>
                </div>
            </div>

            {/* Recapitulatif dynamique */}
            <div className="flex items-start gap-2 px-4 py-3 bg-[#0891b2]/5 rounded-2xl border border-[#0891b2]/10">
                <Info size={14} className="text-dark-cyan-700 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed font-bold text-dark-cyan-700 uppercase tracking-tight">
                    {allowDecimals ? `Nombre décimal (${decimalPlaces} chiffres)` : "Nombre entier"}
                    {unit ? ` • Unité : ${unit}` : " • Aucune unité"}
                    {minValue !== '' && ` • Min : ${minValue}`}
                    {maxValue !== '' && ` • Max : ${maxValue}`}
                </div>
            </div>
        </div>
    );
};