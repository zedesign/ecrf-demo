import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Plus, FileText, Trash2, ArrowRight, 
    ArrowLeft, Layout, Sparkles, GripVertical, 
    CheckCircle2, ChevronDown, Eye, EyeOff, ChevronUp,
    Loader2, Edit3, Printer, FileDown, Search, Copy
} from 'lucide-react';

// Dnd Kit
import { 
    DndContext, 
    rectIntersection, // Changé pour plus de réactivité
    PointerSensor, 
    useSensor, 
    useSensors, 
    MeasuringStrategy
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface FlashMessages { success?: string; error?: string; }
interface PageProps { auth: { user: any }; flash: FlashMessages; [key: string]: any; }
interface BuilderProps { study: any; forms: any[]; }

// --- COMPOSANT ACTIONS CARTE (ÉTAPE 0) ---
function FormCardActions({ formId, onDelete }: { formId: string, onDelete: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-zinc-100 text-dark-cyan-600' : 'text-zinc-400 hover:text-dark-cyan-600 hover:bg-zinc-50'}`}
                >
                    <Copy size={18} />
                </button>
                <button 
                    onClick={() => onDelete(formId)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-zinc-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50/50 opacity-60 cursor-not-allowed">
                            <span className="text-sm font-bold text-zinc-500">Enregistrer comme modèle</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 text-zinc-500 rounded font-black uppercase">À venir</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50/50 opacity-60 cursor-not-allowed">
                            <span className="text-sm font-bold text-zinc-500">Utiliser comme modèle</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 text-zinc-500 rounded font-black uppercase">À venir</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- COMPOSANT FORMULAIRE SORTABLE (ÉTAPE 2) ---
function SortableFormItem({ form, visitId, onUpdate, onRemove, visitHidden }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: form.id });
    
    const style = { 
        transform: CSS.Translate.toString(transform), 
        transition: transition || 'transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Courbe plus nerveuse
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : (visitHidden ? 0.5 : 1) 
    };
    
    return (
        <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 border rounded-xl group transition-all ${visitHidden ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-50 border-zinc-100 hover:bg-white hover:border-dark-cyan-100'}`}>
            <div {...attributes} {...listeners} className="text-zinc-300 cursor-grab active:cursor-grabbing hover:text-dark-cyan-600"><GripVertical size={16} /></div>
            <input disabled={visitHidden} className={`flex-1 bg-transparent border-none focus:ring-0 font-semibold text-sm p-0 ${visitHidden ? 'text-zinc-400' : 'text-zinc-700'}`} value={form.title} onChange={(e) => onUpdate(visitId, form.id, e.target.value)} placeholder="Nom du sous-formulaire..." />
            <button onClick={() => onRemove(visitId, form.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
        </div>
    );
}

// --- COMPOSANT VISITE SORTABLE (ÉTAPE 2) ---
function SortableVisitItem({ visit, onUpdateTitle, onRemove, onAddForm, onUpdateForm, onRemoveForm, onFormReorder, onToggleHide }: any) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: visit.id });
    
    const style = { 
        transform: CSS.Translate.toString(transform), 
        transition: transition || 'transform 250ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        zIndex: isDragging ? 40 : 'auto',
        opacity: isDragging ? 0.4 : 1 
    };
    
    return (
        <div ref={setNodeRef} style={style} className={`bg-white border rounded-3xl mb-4 overflow-hidden shadow-sm transition-all ${visit.isHidden ? 'border-zinc-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className={`px-5 py-3 flex items-center justify-between border-b ${visit.isHidden ? 'bg-zinc-100/80' : 'bg-zinc-50/50'}`}>
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div {...attributes} {...listeners} className="text-zinc-400 cursor-grab hover:text-dark-cyan-600 shrink-0"><GripVertical size={18} /></div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <input className={`text-lg font-bold bg-transparent border-none focus:ring-0 p-0 tracking-tight w-full ${visit.isHidden ? 'text-zinc-400 italic' : 'text-zinc-900'}`} value={visit.title} onChange={(e) => onUpdateTitle(visit.id, e.target.value)} />
                        {isCollapsed && visit.subsections.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {visit.subsections.map((s: any) => (
                                    <span key={s.id} className="text-[10px] px-2 py-0.5 bg-zinc-200/50 text-zinc-500 rounded-md font-bold">{s.title}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => onToggleHide(visit.id)} className={`p-1.5 ${visit.isHidden ? 'text-dark-cyan-600' : 'text-zinc-300 hover:text-zinc-600'}`}><EyeOff size={18} /></button>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 text-zinc-300 hover:text-zinc-600">{isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                    <button onClick={() => onAddForm(visit.id)} className="px-3 py-1.5 bg-dark-cyan-50 text-dark-cyan-700 rounded-lg font-bold text-xs hover:bg-dark-cyan-100 transition-all shadow-sm">
                        <Plus size={14} className="inline mr-1" /> Ajouter un formulaire
                    </button>
                    <button onClick={() => onRemove(visit.id)} className="p-1.5 text-zinc-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                </div>
            </div>
            {!isCollapsed && (
                <div className={`p-4 space-y-2 ${visit.isHidden ? 'grayscale opacity-60 bg-zinc-50/30' : ''}`}>
                    <DndContext collisionDetection={rectIntersection} modifiers={[restrictToVerticalAxis]} onDragEnd={(e) => onFormReorder(visit.id, e)}>
                        <SortableContext items={visit.subsections.map((s:any) => s.id)} strategy={verticalListSortingStrategy}>
                            {visit.subsections.map((form: any) => (
                                <SortableFormItem key={form.id} form={form} visitId={visit.id} onUpdate={onUpdateForm} onRemove={onRemoveForm} visitHidden={visit.isHidden} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

export default function Builder({ study, forms = [] }: BuilderProps) {
    const { props } = usePage<PageProps>();
    const [step, setStep] = useState<'list' | 'step1' | 'step2'>('list');
    const [isSaving, setIsSaving] = useState(false);
    const [visits, setVisits] = useState<any[]>([]);
    const hasExistingForms = forms && forms.length > 0;

    useEffect(() => {
        if (hasExistingForms) {
            setVisits(forms.map(f => ({ 
                id: f.id, 
                title: f.title, 
                isHidden: f.is_hidden || false, 
                order: f.order, // <--- AJOUTE CECI
                subsections: f.sections ? f.sections.map((s: any) => ({ 
                    id: s.id, 
                    title: s.title,
                    order: s.order // <--- AJOUTE CECI AUSSI
                })) : [] 
            })));
        } else {
            setVisits([{ id: 'v1', title: 'Baseline', isHidden: false, order: 0, subsections: [{ id: 's1', title: 'Examen Clinique', order: 0 }] }]);
        }
    }, [forms]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } })); // Réduit pour plus de nervosité

    const saveStructure = () => {
        setIsSaving(true);
        
        // On définit explicitement les types pour TypeScript
        const visitsWithOrder = visits.map((visit: any, visitIndex: number) => ({
            ...visit,
            order: visitIndex, 
            subsections: visit.subsections.map((sub: any, subIndex: number) => ({
                ...sub,
                order: subIndex 
            }))
        }));

        router.post(route('studies.crf-builder.store', { study: study.protocol_code }), 
            { visits: visitsWithOrder }, 
            {
                preserveScroll: true,
                onSuccess: () => { 
                    setIsSaving(false); 
                    setStep('list'); 
                },
                onFinish: () => setIsSaving(false)
            }
        );
    };

    return (
        <AppLayout study={study} breadcrumbs={[{ title: study?.protocol_code, href: `/studies/${study?.protocol_code}` }, { title: 'Builder', href: '#' }]}>
            <Head title={`Builder - ${study.protocol_code}`} />

            {/* Notification Flash */}
            {props.flash?.success && (
                <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right-10 shadow-2xl rounded-2xl bg-white border-l-4 border-emerald-500 p-4 flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600"><CheckCircle2 size={24} /></div>
                    <div><p className="font-bold text-zinc-900">Succès !</p><p className="text-sm text-zinc-500">{props.flash.success}</p></div>
                </div>
            )}

            {/* ETAPE 0 */}
            {step === 'list' && (
                <div className="w-full px-10 py-10 max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Constructeur d'eCRF</h1>
                            <p className="text-zinc-500 font-medium mt-2 uppercase tracking-widest text-xs">Protocole : {study.protocol_code}</p>
                        </div>
                        <button onClick={() => hasExistingForms ? setStep('step2') : setStep('step1')} className="flex items-center gap-2 px-6 py-4 bg-dark-cyan-600 text-white rounded-2xl font-bold hover:bg-dark-cyan-700 shadow-lg transition-all active:scale-95">
                            {hasExistingForms ? <><Edit3 size={20} /> Modifier le Plan de l'eCRF</> : <><Plus size={20} /> Créer un nouvel eCRF</>}
                        </button>
                    </div>

                    {!hasExistingForms ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[3rem]">
                            <Layout size={64} className="text-zinc-300 mb-6" />
                            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Aucune structure détectée</h2>
                            <button onClick={() => setStep('step1')} className="mt-4 px-8 py-3 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-xl hover:bg-zinc-100 transition-all">Initialiser maintenant</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {forms.map((form) => (
                                <div key={form.id} className="group relative bg-white border border-zinc-100 rounded-[2.5rem] p-7 hover:shadow-2xl hover:border-dark-cyan-200 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="h-14 w-14 bg-dark-cyan-50 text-dark-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={28} /></div>
                                        <FormCardActions formId={form.id} onDelete={(id) => console.log('Delete', id)} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">{form.title}</h3>
                                    <p className="text-zinc-400 font-medium mb-8">{form.sections_count || 0} sections actives</p>
                                    <button onClick={() => window.location.href = route('forms.edit', { form: form.id })} className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-50 text-zinc-900 rounded-2xl font-bold group-hover:bg-dark-cyan-600 group-hover:text-white transition-all">
                                        Éditer le contenu <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ETAPE 1 */}
            {step === 'step1' && (
                <div className="w-full px-10 py-10 max-w-[1600px] mx-auto">
                    <div className="max-w-4xl mx-auto py-20 text-center animate-in zoom-in-95">
                        <button onClick={() => setStep('list')} className="text-zinc-400 font-bold mb-10 inline-flex items-center gap-2 hover:text-dark-cyan-600"><ArrowLeft size={20} /> Retour</button>
                        <h2 className="text-4xl font-black mb-12 text-zinc-900 tracking-tight">Créer un nouvel eCRF</h2>
                        <div className="grid grid-cols-2 gap-8 text-left">
                            <div onClick={() => setStep('step2')} className="group p-10 bg-white border-2 border-zinc-100 rounded-[3rem] hover:border-dark-cyan-500 cursor-pointer transition-all hover:shadow-2xl">
                                <div className="h-16 w-16 bg-dark-cyan-50 text-dark-cyan-600 rounded-2xl flex items-center justify-center mb-8"><Layout size={32} /></div>
                                <h3 className="text-2xl font-bold mb-3">Créer à partir de Zéro</h3>
                                <p className="text-zinc-500 font-medium leading-relaxed">Configurez manuellement l'architecture de votre étude. Définissez vos visites cliniques et vos formulaires personnalisés.</p>
                            </div>
                            <div className="p-10 bg-zinc-50 border-2 border-transparent rounded-[3rem] opacity-50 grayscale cursor-not-allowed">
                                <div className="h-16 w-16 bg-zinc-200 text-zinc-400 rounded-2xl flex items-center justify-center mb-8"><Sparkles size={32} /></div>
                                <h3 className="text-2xl font-bold text-zinc-400 mb-3">Importer via Modèle</h3>
                                <p className="text-zinc-400 font-medium italic">Bientôt disponible : Importez des standards CDISC ou utilisez l'IA.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ETAPE 2 */}
            {step === 'step2' && (
                <div className="w-full px-6 py-10 max-w-6xl mx-auto animate-in slide-in-from-right-4">
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-4 mb-10 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep(hasExistingForms ? 'list' : 'step1')} className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:text-dark-cyan-600 transition-colors"><ArrowLeft size={20} /></button>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{study.protocol_code}</h2>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Éditeur de structure</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-100 text-zinc-400 hover:bg-zinc-50"><Search size={18} /></button>
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-100 text-zinc-400 hover:bg-zinc-50"><Printer size={18} /></button>
                            <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-100 text-zinc-400 hover:bg-zinc-50"><FileDown size={18} /></button>
                            <div className="w-[1px] h-6 bg-zinc-100 mx-1" />
                            <button disabled className="px-4 py-2 bg-zinc-50 text-zinc-400 rounded-xl font-bold text-sm border border-zinc-100 flex items-center gap-2 cursor-not-allowed">
                                <Copy size={16} /> Enregistrer en tant que modèle ( à venir )
                            </button>
                            <button disabled={isSaving} onClick={saveStructure} className="flex items-center gap-2 px-6 py-2 bg-dark-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                                {isSaving ? 'Enregistrement...' : 'Enregistrer la structure'}
                            </button>
                        </div>
                    </div>

                    <div className="px-4">
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={rectIntersection} // CHANGÉ ICI
                            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                            modifiers={[restrictToVerticalAxis]} 
                            onDragEnd={(e) => {
                                 const { active, over } = e;
                                 if (over && active.id !== over.id) {
                                     setVisits((items) => {
                                         const oldIndex = items.findIndex((i) => i.id === active.id);
                                         const newIndex = items.findIndex((i) => i.id === over.id);
                                         return arrayMove(items, oldIndex, newIndex);
                                     });
                                 }
                            }}
                        >
                            <SortableContext items={visits.map(v => v.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {visits.map((visit) => (
                                        <SortableVisitItem 
                                            key={visit.id} visit={visit} 
                                            onUpdateTitle={(id:any, title:any) => setVisits(visits.map(v => v.id === id ? { ...v, title } : v))}
                                            onRemove={(id:any) => setVisits(visits.filter(v => v.id !== id))} 
                                            onAddForm={(vId:any) => setVisits(visits.map(v => v.id === vId ? { ...v, subsections: [...v.subsections, { id: `temp-s-${Date.now()}`, title: 'Nouveau Formulaire' }] } : v))} 
                                            onUpdateForm={(vId:any, fId:any, title:any) => setVisits(visits.map(v => v.id === vId ? { ...v, subsections: v.subsections.map((s:any) => s.id === fId ? { ...s, title } : s) } : v))}
                                            onRemoveForm={(vId:any, fId:any) => setVisits(visits.map(v => v.id === vId ? { ...v, subsections: v.subsections.filter((s:any) => s.id !== fId) } : v))} 
                                            onFormReorder={(vId:any, e:any) => {
                                                const { active, over } = e;
                                                if (over && active.id !== over.id) {
                                                    setVisits(prev => prev.map(v => v.id === vId ? { ...v, subsections: arrayMove(v.subsections, v.subsections.findIndex((s:any) => s.id === active.id), v.subsections.findIndex((s:any) => s.id === over.id)) } : v));
                                                }
                                            }}
                                            onToggleHide={(id:any) => setVisits(visits.map(v => v.id === id ? { ...v, isHidden: !v.isHidden } : v))}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        <button onClick={() => setVisits([...visits, { id: `temp-${Date.now()}`, title: 'Nouvelle Visite', isHidden: false, subsections: [] }])} className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-3xl text-zinc-300 font-bold hover:border-dark-cyan-200 hover:text-dark-cyan-600 hover:bg-dark-cyan-50/30 transition-all flex items-center justify-center gap-2 mt-6 uppercase text-xs tracking-widest">
                            <Plus size={20} /> Ajouter une visite
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}