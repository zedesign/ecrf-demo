import React from 'react';
import { Binary, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NumberRendererProps {
    field: any;
    value: string | number;
    onChange: (value: string) => void;
    error?: string;
}

export const NumberRenderer = ({ field, value, onChange, error: externalError }: NumberRendererProps) => {
    const settings = field.settings || {};
    
    const unit = settings.unit || "";
    const allowDecimals = settings.allowDecimals || false;
    const decimalPlaces = Number(settings.decimalPlaces) || 2;
    const minValue = settings.minValue !== '' ? Number(settings.minValue) : null;
    const maxValue = settings.maxValue !== '' ? Number(settings.maxValue) : null;

    // Validation locale pour les bornes Min/Max
    const numericValue = value !== '' ? Number(value) : null;
    const isOutOfRange = (minValue !== null && numericValue !== null && numericValue < minValue) || 
                        (maxValue !== null && numericValue !== null && numericValue > maxValue);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        if (newValue === "") {
            onChange("");
            return;
        }

        if (!allowDecimals) {
            // Force l'entier
            newValue = newValue.split('.')[0].split(',')[0];
        } else {
            // Contrôle strict des décimales
            if (newValue.includes('.')) {
                const parts = newValue.split('.');
                if (parts[1].length > decimalPlaces) {
                    newValue = `${parts[0]}.${parts[1].slice(0, decimalPlaces)}`;
                }
            }
        }

        onChange(newValue);
    };

    const noSpinnersClassName = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
        <div className="space-y-2 animate-in fade-in duration-300">
            {/* LABEL & BADGE UNITÉ
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#0891b2]/10 rounded-lg">
                        <Binary size={14} className="text-[#0891b2]" />
                    </div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        {field.label || "Valeur numérique"}
                        {field.required && <span className="text-[#0891b2] ml-1">*</span>}
                    </label>
                </div>
                
                {unit && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md border border-zinc-200/50">
                        Unité : {unit}
                    </span>
                )}
            </div> */}

            {/* INPUT PRINCIPAL */}
            <div className="relative group">
                <input
                    type="number"
                    step={allowDecimals ? (1 / Math.pow(10, decimalPlaces)).toString() : "1"}
                    value={value || ''}
                    onChange={handleInputChange}
                    placeholder={allowDecimals ? `0.${"0".repeat(decimalPlaces)}` : "0"}
                    className={cn(
                        "w-full h-14 bg-white border-2 border-zinc-100 rounded-2xl px-5",
                        "text-sm font-bold text-zinc-700 transition-all outline-none",
                        "focus:border-dark-cyan-600 focus:ring-4 focus:ring-dark-cyan-600/5",
                        "group-hover:border-zinc-200 shadow-sm",
                        (isOutOfRange || externalError) ? "border-red-500 focus:border-red-500 focus:ring-red-500/5" : "",
                        noSpinnersClassName
                    )}
                />
                
                {/* Unité mise en valeur à droite */}
                {unit && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-zinc-100 pl-4">
                        <span className="text-[12px] font-black uppercase tracking-widest text-zinc-600">
                            {unit}
                        </span>
                    </div>
                )}
            </div>

            {/* BARRE D'ÉTAT & ERREURS */}
            <div className="flex items-center justify-between px-2">
                {isOutOfRange ? (
                    <div className="flex items-center gap-1 text-red-500 animate-in slide-in-from-top-1">
                        <AlertCircle size={10} strokeWidth={3} />
                        <p className="text-[9px] font-black uppercase tracking-tight">
                            {numericValue! < minValue! 
                                ? `Valeur minimale requise : ${minValue}` 
                                : `Valeur maximale autorisée : ${maxValue}`
                            }
                        </p>
                    </div>
                ) : externalError ? (
                    <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle size={10} strokeWidth={3} />
                        <p className="text-[9px] font-black uppercase tracking-tight">{externalError}</p>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {minValue !== null && (
                            <span className={cn("text-[9px] font-bold uppercase tracking-tight", value !== '' && numericValue! < minValue ? "text-red-500" : "text-zinc-400")}>
                                Min: {minValue}
                            </span>
                        )}
                        {maxValue !== null && (
                            <span className={cn("text-[9px] font-bold uppercase tracking-tight", value !== '' && numericValue! > maxValue ? "text-red-500" : "text-zinc-400")}>
                                Max: {maxValue}
                            </span>
                        )}
                    </div>
                )}
                
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tight">
                    {allowDecimals ? `Précision : ${decimalPlaces} déc.` : "Format : Entier"}
                </span>
            </div>
        </div>
    );
};