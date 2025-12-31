import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, List, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SelectionRendererProps {
    field: {
        id: string;
        type: 'select' | 'radio' | 'checkbox';
        label?: string;
        options?: Array<{ label: string; value: string }>;
        required?: boolean;
        placeholder?: string;
        layout?: 'vertical' | 'horizontal';
    };
    value: any;
    onChange: (fieldId: string, value: any) => void;
}

export const SelectionRenderer = ({ field, value, onChange }: SelectionRendererProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // MODIFICATION ICI : On accepte tout, tant qu'il y a un label OU une valeur
    const options = (field.options || []).filter(opt => 
        (opt.label && opt.label.trim() !== "") || (opt.value && opt.value.trim() !== "")
    );
    
    const isVertical = field.layout !== 'horizontal';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (options.length === 0) {
        return (
            <div className="flex items-center gap-3 px-4 py-6 border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50 justify-center">
                <AlertCircle size={14} className="text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Aucune option configurée
                </span>
            </div>
        );
    }

    // --- RENDU 1 : SELECT ---
    if (field.type === 'select') {
        // On cherche l'option sélectionnée en comparant la valeur stockée 
        // avec soit la value de l'option, soit son identifiant généré
        const selectedOption = options.find((opt, i) => {
            const optId = opt.value && opt.value.trim() !== "" ? opt.value : `${field.id}-opt-${i}`;
            return optId === value;
        });

        return (
            <div className="relative animate-in fade-in duration-300" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-14 px-4 bg-white border rounded-2xl flex items-center justify-between transition-all shadow-sm outline-none",
                        isOpen ? "border-dark-cyan-600 ring-4 ring-cyan-50" : "border-zinc-200 hover:border-zinc-300"
                    )}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <List size={16} className={cn("shrink-0", isOpen ? "text-dark-cyan-700" : "text-zinc-400")} />
                        <span className={cn("text-sm truncate font-bold uppercase tracking-tight text-left", !selectedOption ? "text-zinc-400 font-medium normal-case" : "text-zinc-700")}>
                            {selectedOption ? (selectedOption.label || selectedOption.value) : (field.placeholder || "Sélectionnez...")}
                        </span>
                    </div>
                    <ChevronDown size={16} className={cn("text-zinc-400 transition-transform duration-300", isOpen && "rotate-180 text-dark-cyan-700")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 duration-200 origin-top">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.map((opt, i) => {
                                // Génération du même ID unique que pour la recherche
                                const optId = opt.value && opt.value.trim() !== "" ? opt.value : `${field.id}-opt-${i}`;
                                const isOptionSelected = value === optId;

                                return (
                                    <div
                                        key={`select-item-${field.id}-${i}`}
                                        onClick={() => {
                                            onChange(field.id, optId);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 last:mb-0 text-left",
                                            isOptionSelected 
                                                ? "bg-cyan-50 text-dark-cyan-700" 
                                                : "hover:bg-zinc-50 text-zinc-600"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest truncate mr-2">
                                            {opt.label || opt.value || `Option ${i + 1}`}
                                        </span>
                                        {isOptionSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDU 2 : RADIO ---
    if (field.type === 'radio') {
        return (
            <div className={cn("gap-3 flex", isVertical ? "flex-col" : "flex-row flex-wrap")}>
                {options.map((opt, i) => {
                    const optionIdentifier = opt.value && opt.value.trim() !== "" 
                        ? opt.value 
                        : `${field.id}-radio-val-${i}`;
                    
                    const isSelected = value === optionIdentifier;
                    
                    return (
                        <button
                            key={`${field.id}-radio-${i}`}
                            type="button"
                            onClick={() => onChange(field.id, optionIdentifier)}
                            className={cn(
                                "flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left min-w-[140px]",
                                isSelected 
                                    ? "border-dark-cyan-600 bg-cyan-50/30 shadow-sm" 
                                    : "border-zinc-100 bg-white hover:border-zinc-200 shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-black uppercase tracking-widest",
                                isSelected ? "text-dark-cyan-600" : "text-zinc-500"
                            )}>
                                {opt.label || opt.value || `Option ${i + 1}`}
                            </span>
                            
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4",
                                isSelected ? "border-dark-cyan-600 bg-dark-cyan-600" : "border-zinc-200"
                            )}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white transition-transform scale-100" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }

    // --- RENDU 3 : CHECKBOX ---
    if (field.type === 'checkbox') {
        const currentSelection = Array.isArray(value) ? value : [];

        return (
            <div className={cn("gap-3 flex", isVertical ? "flex-col" : "flex-row flex-wrap")}>
                {options.map((opt, i) => {
                    const optionIdentifier = opt.value && opt.value.trim() !== "" 
                        ? opt.value 
                        : `${field.id}-check-val-${i}`;
                    
                    const isChecked = currentSelection.includes(optionIdentifier);

                    return (
                        <button
                            key={`${field.id}-check-${i}`}
                            type="button"
                            onClick={() => {
                                const nextValue = isChecked
                                    ? currentSelection.filter((v: any) => v !== optionIdentifier)
                                    : [...currentSelection, optionIdentifier];
                                onChange(field.id, nextValue);
                            }}
                            className={cn(
                                "flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all text-left min-w-[140px]",
                                isChecked 
                                    ? "border-dark-cyan-600 bg-cyan-50/30 shadow-sm" 
                                    : "border-zinc-100 bg-white hover:border-zinc-200 shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-black uppercase tracking-widest",
                                isChecked ? "text-dark-cyan-600" : "text-zinc-500"
                            )}>
                                {opt.label || opt.value || `Option ${i + 1}`}
                            </span>
                            
                            <div className={cn(
                                "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ml-4",
                                isChecked ? "border-dark-cyan-600 bg-dark-cyan-600" : "border-zinc-200"
                            )}>
                                {isChecked && <Check size={12} className="text-white" strokeWidth={4} />}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }

    return null;
};