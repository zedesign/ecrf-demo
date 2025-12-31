import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { GripVertical, Plus, Trash2, CheckCircle2, Layers, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DndContext, rectIntersection, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface PopupBuilderProps {
    formId: string | number; 
    initialData: any; 
    onClose: () => void;
    onSuccess?: () => void;
}

function SortableSectionItem({ section, onUpdateTitle, onRemove }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    const style = { 
        transform: CSS.Translate.toString(transform), 
        transition, 
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.6 : 1
    };
    
    return (
        <div ref={setNodeRef} style={style} className={cn(
            "group bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-6", 
            isDragging && "border-[#0891b2] shadow-2xl scale-[1.02]"
        )}>
            <div {...attributes} {...listeners} className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 cursor-grab shrink-0">
                <GripVertical size={20} />
            </div>
            <input 
                type="text" 
                value={section.title} 
                onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                className="flex-1 border-none focus:ring-0 text-lg font-black text-zinc-900 uppercase p-0 bg-transparent"
            />
            <button onClick={() => onRemove(section.id)} className="h-10 w-10 text-zinc-300 hover:text-red-500 rounded-xl transition-all">
                <Trash2 size={18} />
            </button>
        </div>
    );
}

export default function PopupBuilder({ formId, initialData, onClose, onSuccess }: PopupBuilderProps) {
    const [sections, setSections] = useState(() => JSON.parse(JSON.stringify(initialData.sections || [])));
    const [isSaving, setIsSaving] = useState(false);
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s: any) => s.id === active.id);
            const newIndex = sections.findIndex((s: any) => s.id === over.id);
            setSections(arrayMove(sections, oldIndex, newIndex));
        }
    };

    const handleFinish = () => {
        setIsSaving(true);

        // On respecte la validation PHP : sections est un tableau d'objets (id, title, order)
        const payload = {
            sections: sections.map((s: any, index: number) => ({
                id: s.id,
                title: s.title,
                order: index
            }))
        };

        router.post(route('forms.sections.reorder-simple', formId), payload, {
            onSuccess: () => {
                setIsSaving(false);
                // On recharge uniquement les données du formulaire pour mettre à jour l'éditeur
                router.reload({ 
                    only: ['form'],
                    onSuccess: () => {
                        if (onSuccess) onSuccess();
                        onClose();
                    }
                });
            },
            onError: (errors) => {
                setIsSaving(false);
                console.error("Erreur de validation:", errors);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#fcfcfd] w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col border border-white/20 overflow-hidden">
                <div className="bg-white border-b border-zinc-100 px-10 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center text-[#0891b2]">
                            <Layers size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Organiser les formulaires</h2>
                    </div>
                    <button onClick={onClose} className="px-6 py-3 bg-zinc-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-zinc-500 hover:bg-zinc-200 transition-colors">
                        Fermer
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-[#f8f9fa]">
                    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={sections.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4 max-w-2xl mx-auto">
                                {sections.map((section: any) => (
                                    <SortableSectionItem 
                                        key={section.id} 
                                        section={section} 
                                        onUpdateTitle={(id: any, title: string) => 
                                            setSections(sections.map((s: any) => s.id === id ? { ...s, title } : s))
                                        }
                                        onRemove={(id: any) => setSections(sections.filter((s: any) => s.id !== id))}
                                    />
                                ))}
                                <button 
                                    onClick={() => setSections([...sections, { id: `new-${Date.now()}`, title: 'NOUVEAU FORMULAIRE' }])}
                                    className="w-full py-8 border-2 border-dashed border-zinc-200 rounded-[2rem] text-zinc-400 font-bold hover:border-[#0891b2] hover:text-[#0891b2] transition-all flex items-center justify-center gap-2 mt-4 uppercase text-[11px] tracking-widest"
                                >
                                    <Plus size={18} /> Ajouter un formulaire
                                </button>
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="bg-white border-t border-zinc-100 px-10 py-8 flex justify-center">
                    <button 
                        onClick={handleFinish} 
                        disabled={isSaving}
                        className="px-12 py-5 bg-[#0891b2] text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {isSaving ? "Synchronisation..." : "Appliquer les changements"}
                    </button>
                </div>
            </div>
        </div>
    );
}