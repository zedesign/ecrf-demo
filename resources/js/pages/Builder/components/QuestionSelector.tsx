import React from 'react';
import { 
    Type, CheckSquare, CircleDot, Calendar, Hash, 
    Download, Star, Percent, ChevronDown, Sliders,
    Info, Heading, Image as ImageIcon, Search, Lock
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const QuestionSelector = ({ onSelect }: { onSelect: (type: string) => void }) => {
    // Liste des types actuellement fonctionnels
    const functionalTypes = ['text', 'checkbox', 'radio', 'date', 'select', 'number'];

    const categories = [
        {
            title: "Éléments de saisie",
            items: [
                { id: 'text', label: 'Champ Texte', icon: <Type size={16} />, desc: 'Réponses libres courtes ou longues' },
                { id: 'checkbox', label: 'Cases à cocher', icon: <CheckSquare size={16} />, desc: 'Choix multiples possibles' },
                { id: 'radio', label: 'Boutons Radio', icon: <CircleDot size={16} />, desc: 'Un seul choix unique' },
                { id: 'date', label: 'Sélecteur de Date', icon: <Calendar size={16} />, desc: 'Date et heure' },
                { id: 'number', label: 'Nombre', icon: <Hash size={16} />, desc: 'Valeurs numériques' },
                { id: 'select', label: 'Liste déroulante', icon: <ChevronDown size={16} />, desc: 'Sélection dans un menu' },
                { id: 'scale', label: 'Échelle de notation', icon: <Star size={16} />, desc: 'Évaluation par étoiles ou points' },
                { id: 'slider', label: 'Curseur', icon: <Sliders size={16} />, desc: 'Plage de valeurs glissante' },
                { id: 'upload', label: 'Téléchargement de fichier', icon: <Download size={16} />, desc: 'Documents et images' },
                { id: 'calc', label: 'Champ Calculé', icon: <Percent size={16} />, desc: 'Calcul automatique' },
            ]
        },
        {
            title: "Mise en page",
            items: [
                { id: 'header', label: 'Titre de section', icon: <Heading size={16} />, desc: 'Structurer le formulaire' },
                { id: 'instruction', label: 'Note d\'information', icon: <Info size={16} />, desc: 'Instructions aux utilisateurs' },
                { id: 'image', label: 'Illustration', icon: <ImageIcon size={16} />, desc: 'Afficher une image' },
            ]
        }
    ];

    return (
        <div className="relative w-[580px] bg-white rounded-[1.5rem] border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header avec barre de recherche */}
            <div className="flex items-center px-6 py-4 border-b border-zinc-100 bg-white shrink-0">
                <Search className="mr-3 h-4 w-4 text-zinc-400" />
                <input
                    placeholder="Rechercher un type de champ..."
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400 text-zinc-600"
                    disabled
                />
            </div>

            {/* Liste des éléments */}
            <div className="px-4 py-4 max-h-[420px] overflow-y-auto bg-white custom-scrollbar">
                {categories.map((cat, idx) => (
                    <div key={cat.title} className={cn(idx > 0 && "mt-8")}>
                        <div className="flex items-center gap-4 px-2 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {cat.title}
                            </span>
                            <div className="h-px flex-1 bg-zinc-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {cat.items.map((item) => {
                                const isAvailable = functionalTypes.includes(item.id);
                                
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => isAvailable && onSelect(item.id)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-2xl p-3 text-left transition-all border border-transparent",
                                            isAvailable 
                                                ? "hover:bg-zinc-50 hover:border-zinc-100 group cursor-pointer" 
                                                : "opacity-40 cursor-not-allowed grayscale-[0.5]"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm",
                                            isAvailable 
                                                ? "bg-zinc-50 text-zinc-500 group-hover:bg-[#0891b2] group-hover:text-white group-hover:shadow-[#0891b2]/20" 
                                                : "bg-zinc-100 text-zinc-400"
                                        )}>
                                            {item.icon}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={cn(
                                                    "text-[13px] font-bold leading-tight transition-colors",
                                                    isAvailable ? "text-zinc-700 group-hover:text-[#0891b2]" : "text-zinc-500"
                                                )}>
                                                    {item.label}
                                                </p>
                                                {!isAvailable && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-zinc-100 text-zinc-400 rounded-md border border-zinc-200/50">
                                                        Bientôt
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-medium">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer informatif */}
            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 shrink-0">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    Éditeur de formulaire v2.0
                </p>
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0891b2]" />
                </div>
            </div>
        </div>
    );
};