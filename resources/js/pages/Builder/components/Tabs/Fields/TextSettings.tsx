import React, { useEffect, useState } from 'react';
import { 
    Settings2, Info, ShieldCheck, Asterisk, 
    Type, Maximize2, Minimize2, AlignLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface TextSettingsProps {
    field: any;
    onUpdate: (updates: any) => void;
}

export const TextSettings = ({ field, onUpdate }: TextSettingsProps) => {
    
    // 1. Initialisation sécurisée des valeurs
    const getInitialValue = (key: string, defaultValue: any) => {
        if (field[key] !== undefined) return field[key];
        if (field.settings && field.settings[key] !== undefined) return field.settings[key];
        return defaultValue;
    };

    // 2. État local pour éviter les sauts d'interface
    const [textType, setTextType] = useState(getInitialValue('textType', 'text'));
    const [isRequired, setIsRequired] = useState(getInitialValue('required', false));
    const [isSensitive, setIsSensitive] = useState(getInitialValue('sensitive', false));
    const [minLength, setMinLength] = useState(getInitialValue('minLength', ''));
    const [maxLength, setMaxLength] = useState(getInitialValue('maxLength', ''));

    // Limites strictes selon le type
    const MAX_LIMIT = textType === 'textarea' ? 2000 : 255;

    // 3. Synchronisation si le champ change depuis le parent
    useEffect(() => {
        setTextType(getInitialValue('textType', 'text'));
        setIsRequired(getInitialValue('required', false));
        setIsSensitive(getInitialValue('sensitive', false));
        setMinLength(getInitialValue('minLength', ''));
        setMaxLength(getInitialValue('maxLength', ''));
    }, [field.id]);

    // 4. Fonction d'émission synchronisée (Racine + Settings)
    const emitUpdate = (newValues: any) => {
        const updatedData = {
            textType,
            required: isRequired,
            sensitive: isSensitive,
            minLength,
            maxLength,
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

    // Gestion du changement de type de texte avec vérification des limites
    const handleTypeChange = (type: string) => {
        const newLimit = type === 'textarea' ? 2000 : 255;
        let newMax = maxLength;
        
        if (maxLength && parseInt(maxLength as string) > newLimit) {
            newMax = newLimit.toString();
            setMaxLength(newMax);
        }
        
        setTextType(type);
        emitUpdate({ textType: type, maxLength: newMax });
    };

    const handleMaxChange = (val: string) => {
        const numVal = parseInt(val);
        const finalVal = numVal > MAX_LIMIT ? MAX_LIMIT.toString() : val;
        setMaxLength(finalVal);
        emitUpdate({ maxLength: finalVal });
    };

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

                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Donnée Sensible</span>
                            <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
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

                {/* 2. FORMAT D'ENTRÉE */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <AlignLeft size={14} className="text-dark-cyan-700" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Format d'entrée
                        </label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Type de champ texte</span>
                        <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
                            {[
                                { id: 'text', label: 'Texte court', icon: Type },
                                { id: 'textarea', label: 'Paragraphe', icon: AlignLeft },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => handleTypeChange(mode.id)}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                        textType === mode.id 
                                            ? "bg-white text-dark-cyan-700 shadow-sm" 
                                            : "text-zinc-400 hover:text-zinc-500"
                                    )}
                                >
                                    <mode.icon size={12} />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isSensitive && (
                <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 animate-in slide-in-from-top-1">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed font-medium text-amber-600 uppercase tracking-tight">
                        La donnée sera chiffrée en base de données pour ce champ texte.
                    </p>
                </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* 3. CONFIGURATION AVANCÉE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Settings2 size={14} className="text-dark-cyan-700" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Contraintes de saisie
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
                            <Minimize2 size={10} /> Longueur Min.
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minLength}
                            onChange={(e) => { setMinLength(e.target.value); emitUpdate({ minLength: e.target.value }); }}
                            className="w-full bg-zinc-50 border border-transparent focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 py-3 text-sm font-bold transition-all outline-none text-zinc-700 shadow-sm"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1 flex items-center gap-1">
                            <Maximize2 size={10} /> Longueur Max.
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max={MAX_LIMIT}
                                value={maxLength}
                                onChange={(e) => handleMaxChange(e.target.value)}
                                className="w-full bg-zinc-50 border border-transparent focus:bg-white focus:border-dark-cyan-600 rounded-2xl px-4 py-3 text-sm font-bold transition-all outline-none text-zinc-700 shadow-sm"
                                placeholder={MAX_LIMIT.toString()}
                            />
                            <div className="absolute -bottom-5 left-1 flex items-center gap-1.5">
                                <div className={cn("w-1 h-1 rounded-full", textType === 'textarea' ? "bg-amber-500" : "bg-dark-cyan-700")} />
                                <span className={cn("text-[8px] font-black uppercase tracking-widest", textType === 'textarea' ? "text-amber-600" : "text-dark-cyan-700")}>
                                    Limite : {MAX_LIMIT} caractères
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};