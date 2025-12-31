import React from 'react';
import { Type, AlignLeft, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TextRendererProps {
    field: {
        id: string;
        settings?: {
            textType?: 'text' | 'textarea';
            minLength?: string | number;
            maxLength?: string | number;
            sensitive?: boolean;
            placeholder?: string;
        };
    };
    value: string;
    onChange: (fieldId: string, value: string) => void;
}

const TextRenderer = ({ field, value = '', onChange }: TextRendererProps) => {
    const mode = field.settings?.textType || 'text';
    const isSensitive = field.settings?.sensitive || false;
    const minLength = field.settings?.minLength ? parseInt(field.settings.minLength as string) : 0;
    const maxLength = field.settings?.maxLength ? parseInt(field.settings.maxLength as string) : (mode === 'textarea' ? 2000 : 255);
    
    const currentLength = value?.length || 0;
    const isOverLimit = currentLength > maxLength;

    const baseStyles = cn(
        "w-full rounded-2xl border flex items-center transition-all outline-none shadow-sm px-6 font-bold text-sm",
        "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300", 
        "focus:border-dark-cyan-600 focus:ring-4 focus:ring-cyan-50",
        "placeholder:text-zinc-400 placeholder:font-medium placeholder:normal-case placeholder:tracking-tight",
        isOverLimit && "border-red-500 focus:border-red-500 focus:ring-red-500/5"
    );

    return (
        <div className="w-full space-y-2 group animate-in fade-in duration-300">
            <div className="relative">
                {mode === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.settings?.placeholder || "Saisissez votre réponse..."}
                        className={cn(baseStyles, "py-4 min-h-[120px] resize-none")}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.settings?.placeholder || "Saisissez votre réponse..."}
                        className={cn(baseStyles, "h-14")}
                    />
                )}

                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2 pointer-events-none">
                    {isSensitive && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100/50">
                            <ShieldCheck size={10} className="text-amber-600" />
                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Sécurisé</span>
                        </div>
                    )}
                    <div className={cn("transition-colors", value ? "text-[#0891b2]" : "text-zinc-400")}>
                        {mode === 'textarea' ? <AlignLeft size={16} /> : <Type size={16} />}
                    </div>
                </div>
            </div>

            <div className="flex justify-end px-1">
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isOverLimit ? "text-red-500" : "text-zinc-400"
                )}>
                    {currentLength} / {maxLength}
                </span>
            </div>
        </div>
    );
};

export default TextRenderer;