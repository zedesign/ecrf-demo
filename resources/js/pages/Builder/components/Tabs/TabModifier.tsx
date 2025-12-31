import React from 'react';
import { 
    Calendar, ChevronDown, Info, Type, CheckSquare, 
    CircleDot, Hash, Sliders, Star, Download, 
    Percent, Heading, Image as ImageIcon, MessageSquare,
    Type as TypeIcon, FileText, ImagePlus
} from 'lucide-react';
import { cn } from "@/lib/utils";

// IMPORT DES COMPOSANTS FRACTIONNÉS
import { SelectionSettings } from './Fields/SelectionSettings';
import { TextSettings } from './Fields/TextSettings';
import { NumberSettings } from './Fields/NumberSettings';
import { DateSettings } from './Fields/DateSettings';

// Composants UI locaux pour le style cohérent
const ActionButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
            active 
                ? "bg-cyan-50 border-dark-cyan-600 text-dark-cyan-600 shadow-sm" 
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
        )}
    >
        <Icon size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

interface TabModifierProps {
    field: any;
    onUpdate: (updates: any) => void;
}

export const TabModifier = ({ field, onUpdate }: TabModifierProps) => {
    const fieldType = field?.type || 'text';

    const getTypeIcon = () => {
        const icons: Record<string, any> = {
            text: <Type size={16} />,
            date: <Calendar size={16} />,
            checkbox: <CheckSquare size={16} />,
            radio: <CircleDot size={16} />,
            number: <Hash size={16} />,
            calc: <Percent size={16} />,
            slider: <Sliders size={16} />,
            scale: <Star size={16} />,
            header: <Heading size={16} />,
            image: <ImageIcon size={16} />,
            instruction: <MessageSquare size={16} />,
            upload: <Download size={16} />,
            select: <ChevronDown size={16} />
        };
        return icons[fieldType] || <Type size={16} />;
    };

    const renderSpecificOptions = () => {
        switch (fieldType) {
            case 'radio':
            case 'checkbox':
            case 'select':
                return <SelectionSettings field={field} onUpdate={onUpdate} />;
            
            case 'text':
                return <TextSettings field={field} onUpdate={onUpdate} />;

            case 'number':
                return <NumberSettings field={field} onUpdate={onUpdate} />;

            case 'date':
                return <DateSettings field={field} onUpdate={onUpdate} />;
            
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* 1. LIBELLÉ */}
            <div className="space-y-2">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                    {['header', 'instruction'].includes(fieldType) ? 'Texte à afficher' : 'Libellé de la question'}
                </label>
                <input 
                    type="text"
                    value={field?.label || ''}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-dark-cyan-600 focus:ring-4 focus:ring-cyan-50 text-sm font-medium transition-all outline-none text-zinc-700"
                    placeholder="Ex: Quel est votre âge ?"
                />
            </div>

            {/* AJOUT : DESCRIPTION (Conditionnel) */}
            {field.hasDescription && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        Description de la question <FileText size={12} className="text-dark-cyan-700" />
                    </label>
                    <textarea 
                        value={field?.description || ''}
                        onChange={(e) => onUpdate({ description: e.target.value })}
                        className="w-full min-h-[80px] p-4 rounded-xl border border-zinc-200 focus:border-dark-cyan-600 focus:ring-4 focus:ring-cyan-50 text-sm font-medium transition-all outline-none text-zinc-600 resize-none"
                        placeholder="Ajoutez des précisions ou instructions pour ce champ..."
                    />
                </div>
            )}

            {/* AJOUT : IMAGE D'AIDE (Conditionnel) */}
            {field.hasHelpImage && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        URL de l'image d'aide <ImageIcon size={12} className="text-dark-cyan-700" />
                    </label>
                    <input 
                        type="text"
                        value={field?.helpImageUrl || ''}
                        onChange={(e) => onUpdate({ helpImageUrl: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:border-dark-cyan-600 focus:ring-4 focus:ring-cyan-50 text-sm font-medium transition-all outline-none text-zinc-600"
                        placeholder="https://exemple.com/image.jpg"
                    />
                </div>
            )}

            {/* 2. CONFIG TECHNIQUE */}
            {!['header', 'instruction', 'image'].includes(fieldType) && (
                <div className="space-y-6">
                    {/* NOUVEAUX BOUTONS D'ACTIONS */}
                    <div className="flex items-center gap-3">
                        <ActionButton 
                            label="Description" 
                            icon={FileText} 
                            active={field.hasDescription}
                            onClick={() => onUpdate({ hasDescription: !field.hasDescription })}
                        />
                        <ActionButton 
                            label="Image d'aide" 
                            icon={ImagePlus} 
                            active={field.hasHelpImage}
                            onClick={() => onUpdate({ hasHelpImage: !field.hasHelpImage })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                Variable <Info size={14} className="text-zinc-300" />
                            </label>
                            <input 
                                type="text"
                                value={field?.name || ''}
                                onChange={(e) => onUpdate({ name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                className="w-full h-11 px-4 bg-zinc-50/50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 uppercase focus:border-dark-cyan-600 outline-none"
                                placeholder="NOM_DE_VARIABLE"
                            />
                            <p className="text-[9px] font-bold text-dark-cyan-800/60 uppercase tracking-tight ml-1">
                                Format automatique : MAJUSCULES_ET_UNDERSCORES
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Type de champ</label>
                            <div className="w-full h-11 px-4 border border-zinc-100 rounded-lg flex items-center gap-2 text-[10px] font-black text-zinc-400 bg-zinc-50/30 uppercase tracking-widest">
                                <span className="text-dark-cyan-600">{getTypeIcon()}</span>
                                {fieldType}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. OPTIONS FRACTIONNÉES */}
            <div className="pt-6 border-t border-zinc-100">
                {renderSpecificOptions()}
            </div>
        </div>
    );
};