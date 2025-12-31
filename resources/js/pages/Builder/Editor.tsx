import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '@/layouts/app-layout'; 
import { Head, router } from '@inertiajs/react';
import { 
    Eye, PlusCircle, Layout, ChevronDown, ChevronUp, Save, X, 
    Printer, Plus, CheckCircle2, AlertCircle, Download, Trash2,
    Type, Hash, List, CheckSquare, Calendar, Clock, AlignLeft,
    GripVertical, Layers
} from 'lucide-react';
import { cn } from "@/lib/utils";

// --- COMPOSANTS ---
import { QuestionSelector } from './components/QuestionSelector';
import { QuestionEditorBlock } from './components/QuestionEditorBlock';
import { FormPreview } from './FormPreview';
import PopupBuilder from './components/PopupBuilder';

// --- CONFIGURATION DYNAMIQUE DES CHAMPS ---
const FIELD_CONFIG: Record<string, { label: string, icon: any }> = {
    text: { label: 'Champ Texte', icon: Type },
    number: { label: 'Champ Nombre', icon: Hash },
    textarea: { label: 'Zone de texte', icon: AlignLeft },
    select: { label: 'Liste déroulante', icon: List },
    radio: { label: 'Choix unique', icon: CheckCircle2 },
    checkbox: { label: 'Cases à cocher', icon: CheckSquare },
    date: { label: 'Champ Date', icon: Calendar },
    time: { label: 'Champ Heure', icon: Clock },
};

// --- ICONS DE STRUCTURE ---
const LayoutIcons = {
    full: () => (
        <div className="flex gap-1 w-10 h-6">
            <div className="w-full h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
        </div>
    ),
    split: () => (
        <div className="flex gap-1 w-10 h-6">
            <div className="w-1/2 h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
            <div className="w-1/2 h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
        </div>
    ),
    triple: () => (
        <div className="flex gap-1 w-10 h-6">
            <div className="w-1/3 h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
            <div className="w-1/3 h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
            <div className="w-1/3 h-full bg-dark-cyan-600 opacity-20 rounded-sm" />
        </div>
    )
};

const getLayoutIcon = (cols: number) => {
    if (cols === 1) return <LayoutIcons.full />;
    if (cols === 2) return <LayoutIcons.split />;
    return <LayoutIcons.triple />;
};

const FormRow = ({ row, sectionId, onUpdateField, onRemoveField, onAddFieldToRow, onChangeLayout, onRemoveRow, onDuplicateField, onSave }: any) => {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3"
    }[row.columns as 1 | 2 | 3] || "grid-cols-1";

    return (
        <div className="group/row relative mb-6 last:mb-0">
            <div className="flex items-center justify-between mb-3 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Structure de ligne</span>
                    <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200/50 scale-75 origin-left gap-1">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3].map((cols) => (
                                <button
                                    key={cols}
                                    type="button"
                                    onClick={() => onChangeLayout(sectionId, row.id, cols)}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        row.columns === cols 
                                            ? "bg-white text-[#0891b2] shadow-sm border border-zinc-200/50" 
                                            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50"
                                    )}
                                >
                                    {getLayoutIcon(cols)}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-zinc-200/80 mx-0.5" />
                        <button 
                            type="button"
                            onClick={() => onRemoveRow(sectionId, row.id)}
                            className="p-2.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-white hover:shadow-sm hover:border border-transparent hover:border-red-100 transition-all group/trash"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={cn("grid gap-6", gridCols)}>
                {row.fields.map((field: any) => {
                    const fieldConfig = FIELD_CONFIG[field.type] || { icon: Type };
                    return (
                        <div key={field.id} className="relative h-full">
                            <QuestionEditorBlock 
                                field={field} 
                                icon={fieldConfig.icon} 
                                onUpdate={(updates: any) => onUpdateField(sectionId, field.id, updates)} 
                                onDelete={() => onRemoveField(sectionId, field.id)} 
                                onDuplicate={() => onDuplicateField(sectionId, row.id, field.id)}
                                onSave={onSave}
                                isCompact={row.columns >= 2} 
                            />
                        </div>
                    );
                })}
                
                {row.fields.length < row.columns && (
                     <button 
                        type="button"
                        onClick={() => onAddFieldToRow(sectionId, row.id)}
                        className="h-full min-h-[120px] border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-zinc-300 hover:text-dark-cyan-600 hover:border-dark-cyan-200 hover:bg-cyan-50/20 transition-all group/add"
                    >
                        <div className="p-3 bg-zinc-50 rounded-2xl group-hover/add:bg-white transition-colors">
                            <Plus size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Ajouter un champ</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const CollapsibleSection = ({ section, onUpdateField, onRemoveField, onAddRow, onChangeLayout, onAddFieldToRow, onRemoveRow, onDuplicateField, onSave }: any) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showLayoutPicker, setShowLayoutPicker] = useState(false);
    const [selectedRowForAdd, setSelectedRowForAdd] = useState<{sectionId: string, rowId: string} | null>(null);

    const allFields = section.rows?.flatMap((r: any) => r.fields) || [];

    return (
        <section id={`section-${section.id}`} className="mb-8 scroll-mt-32">
            <div className={cn("bg-white border transition-all duration-500 rounded-[2.5rem]", isOpen ? "border-zinc-200 shadow-xl shadow-cyan-900/5" : "border-zinc-100 shadow-sm hover:border-zinc-200")}>
                <div onClick={() => setIsOpen(!isOpen)} className="p-6 md:p-8 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-6 overflow-hidden">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500", isOpen ? "bg-dark-cyan-600 text-white" : "bg-zinc-100 text-zinc-500")}>
                            <Layout size={20} />
                        </div>
                        <div className="flex flex-col gap-2 overflow-hidden">
                            <h2 className="text-xl font-bold text-zinc-900 truncate">{section.title}</h2>
                            {!isOpen && allFields.length > 0 && (
                                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                                    {allFields.map((f: any) => {
                                        const config = FIELD_CONFIG[f.type] || { label: 'Champ', icon: Type };
                                        const Icon = config.icon;
                                        const displayName = (f.label && f.label !== config.label && f.label !== 'Nouveau champ') ? f.label : config.label;
                                        return (
                                            <span key={f.id} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-[9px] font-black uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                                                <Icon size={10} className="text-[#0891b2]" />
                                                {displayName}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                    </div>
                </div>

                {isOpen && (
                    <div className="px-6 md:px-10 pb-10">
                        <div className="space-y-8">
                            {section.rows?.map((row: any) => (
                                <FormRow 
                                    key={row.id}
                                    row={row} 
                                    sectionId={section.id}
                                    onUpdateField={onUpdateField}
                                    onRemoveField={onRemoveField}
                                    onChangeLayout={onChangeLayout}
                                    onRemoveRow={onRemoveRow}
                                    onSave={onSave}
                                    onDuplicateField={onDuplicateField}
                                    onAddFieldToRow={(sId: string, rId: string) => setSelectedRowForAdd({sectionId: sId, rowId: rId})}
                                />
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-zinc-50">
                            {!showLayoutPicker ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowLayoutPicker(true); }} 
                                    className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-[2rem] text-zinc-400 hover:text-dark-cyan-600 hover:border-dark-cyan-200 hover:bg-cyan-50/30 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                                >
                                    <PlusCircle size={20} /> Nouvelle ligne de champs
                                </button>
                            ) : (
                                <div className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="text-center mb-8">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-dark-cyan-600 mb-1">Configuration</h3>
                                        <p className="text-lg font-black text-zinc-900 uppercase tracking-tight">Choisir la structure</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                                        {[1, 2, 3].map((cols) => (
                                            <button
                                                key={cols}
                                                type="button"
                                                onClick={() => {
                                                    onAddRow(section.id, cols);
                                                    setShowLayoutPicker(false);
                                                }}
                                                className="group flex flex-col items-center gap-4 p-6 bg-white border border-zinc-200 rounded-3xl hover:border-dark-cyan-600 hover:shadow-lg transition-all"
                                            >
                                                <div className="text-zinc-300 group-hover:text-[#0891b2] transition-colors scale-125">
                                                    {getLayoutIcon(cols)}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                    {cols} Colonne{cols > 1 ? 's' : ''}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowLayoutPicker(false)} className="mt-6 mx-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors">
                                        <X size={14} /> Annuler
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedRowForAdd && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setSelectedRowForAdd(null)} />
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                        <QuestionSelector onSelect={(type) => { 
                            onAddFieldToRow(selectedRowForAdd.sectionId, selectedRowForAdd.rowId, type); 
                            setSelectedRowForAdd(null); 
                        }} />
                    </div>
                </div>, document.body
            )}
        </section>
    );
};

export default function Editor({ auth, form: initialForm }: { auth: any, form: any }) {
    
    const transformDbToEditor = useCallback((dbForm: any) => {
        if (!dbForm) return null;
        return {
            ...dbForm,
            sections: (dbForm.sections || []).map((section: any) => {
                const rowsMap: { [key: string]: any[] } = {};
                
                (section.fields || []).forEach((field: any) => {
                    const rowIndex = Math.floor(field.order) || 1;
                    if (!rowsMap[rowIndex]) rowsMap[rowIndex] = [];
                    
                    const settings = field.settings || {};
                    
                    rowsMap[rowIndex].push({
                        ...field,
                        type: field.field_type,
                        required: field.is_required === 1 || field.is_required === true || !!settings.required,
                        description: field.help_text || settings.description || '',
                        helpImageUrl: field.help_image || settings.helpImageUrl || null,
                        hasDescription: settings.hasDescription ?? !!(field.help_text),
                        hasHelpImage: settings.hasHelpImage ?? !!(field.help_image),
                        options: settings.options || [],
                        settings: settings 
                    });
                });

                const rows = Object.keys(rowsMap)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((key) => ({
                        id: `row-${section.id}-${key}`,
                        columns: rowsMap[key][0]?.settings?.row_layout_cols || 1,
                        fields: rowsMap[key]
                    }));

                return { ...section, rows };
            })
        };
    }, []);

    const [currentForm, setCurrentForm] = useState(() => transformDbToEditor(initialForm));
    const [showPreview, setShowPreview] = useState(false);
    const [showPopupBuilder, setShowPopupBuilder] = useState(false);
    const [toasts, setToasts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCurrentForm(transformDbToEditor(initialForm));
    }, [initialForm, transformDbToEditor]);

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const handleUpdateStructure = (newData: any) => {
        setCurrentForm(newData);
        setShowPopupBuilder(false);
        addToast("Structure mise à jour avec succès");
    };

    // --- LOGIQUE DE SAUVEGARDE SÉCURISÉE ---
    const handleSave = () => {
        setIsSaving(true);
        const seenNames = new Set();
        let localConflict = false;

        const payload = {
            title: currentForm.title,
            sections: currentForm.sections.map((section: any, sIdx: number) => ({
                id: (typeof section.id === 'string' && section.id.includes('new')) ? null : section.id,
                title: section.title,
                order: sIdx + 1,
                fields: (section.rows || []).flatMap((row: any, rIdx: number) => 
                    (row.fields || []).map((field: any, fIdx: number) => {
                        if (seenNames.has(field.name)) {
                            localConflict = true;
                        }
                        seenNames.add(field.name);
                        const isNew = !field.id || (typeof field.id === 'string' && field.id.includes('new'));
                        
                        return {
                            id: isNew ? null : field.id,
                            name: field.name.toUpperCase().replace(/\s+/g, '_'),
                            label: field.label,
                            field_type: field.type,
                            order: (rIdx + 1) + ((fIdx + 1) / 100),
                            is_required: !!field.required,
                            settings: {
                                ...field.settings,
                                options: field.options || [],
                                row_layout_cols: row.columns || 1,
                                description: field.description || '',
                            }
                        };
                    })
                )
            }))
        };

        if (localConflict) {
            addToast("Erreur : Doublon de nom détecté dans l'éditeur", "error");
            setIsSaving(false);
            return;
        }

        router.put(route('builder.forms.update', currentForm.id), payload, {
            onSuccess: () => {
                setIsSaving(false);
                addToast('Formulaire enregistré avec succès');
                window.dispatchEvent(new Event('form-saved-success'));
            },
            onError: (errors) => {
                setIsSaving(false);
                const serverError = errors[Object.keys(errors)[0]] || "Conflit de variable (Doublon)";
                addToast(serverError, 'error');
            },
            preserveState: true
        });
    };

    const handleAddRow = (sectionId: string, columns: number) => {
        const updatedSections = currentForm.sections.map((s: any) => {
            if (String(s.id) === String(sectionId)) {
                return { ...s, rows: [...(s.rows || []), { id: `row-new-${crypto.randomUUID()}`, columns, fields: [] }] };
            }
            return s;
        });
        setCurrentForm({ ...currentForm, sections: updatedSections });
        addToast('Ligne ajoutée');
    };

    const handleRemoveRow = (sectionId: string, rowId: string) => {
        const updatedSections = currentForm.sections.map((s: any) => {
            if (String(s.id) === String(sectionId)) {
                return { ...s, rows: s.rows.filter((r: any) => r.id !== rowId) };
            }
            return s;
        });
        setCurrentForm({ ...currentForm, sections: updatedSections });
        addToast('Ligne supprimée', 'error');
    };

    const handleAddFieldToRow = (sectionId: string, rowId: string, type: string) => {
        const config = FIELD_CONFIG[type] || { label: 'Nouveau champ' };
        const newField = {
            id: `new-${crypto.randomUUID()}`,
            type,
            label: config.label, 
            name: `${type.toUpperCase()}_${Date.now().toString().slice(-4)}`,
            required: false,
            options: []
        };

        const updatedSections = currentForm.sections.map((s: any) => {
            if (String(s.id) === String(sectionId)) {
                return {
                    ...s,
                    rows: s.rows.map((r: any) => r.id === rowId ? { ...r, fields: [...r.fields, newField] } : r)
                };
            }
            return s;
        });
        setCurrentForm({ ...currentForm, sections: updatedSections });
        addToast('Champ ajouté');
    };

    const handleDuplicateField = (sectionId: string, rowId: string, fieldId: string) => {
        const updatedSections = [...currentForm.sections];
        const sectionIndex = updatedSections.findIndex(s => String(s.id) === String(sectionId));
        if (sectionIndex === -1) return;

        const section = updatedSections[sectionIndex];
        const rowIndex = section.rows.findIndex((r: any) => r.id === rowId);
        if (rowIndex === -1) return;

        const row = section.rows[rowIndex];
        const fieldToDuplicate = row.fields.find((f: any) => f.id === fieldId);
        if (!fieldToDuplicate) return;

        const duplicatedField = {
            ...JSON.parse(JSON.stringify(fieldToDuplicate)),
            id: `new-${crypto.randomUUID()}`,
            name: `${fieldToDuplicate.name}_COPY_${Math.floor(1000 + Math.random() * 9000)}`
        };

        if (row.fields.length < row.columns) {
            row.fields.push(duplicatedField);
        } else {
            const newRow = {
                id: `row-new-${crypto.randomUUID()}`,
                columns: row.columns,
                fields: [duplicatedField]
            };
            section.rows.splice(rowIndex + 1, 0, newRow);
        }

        setCurrentForm({ ...currentForm, sections: updatedSections });
        addToast('Champ dupliqué');
    };

    const handleUpdateField = (sectionId: string, fieldId: string, updates: any) => {
        const updatedSections = currentForm.sections.map((s: any) => ({
            ...s, rows: s.rows?.map((r: any) => ({
                ...r, fields: r.fields?.map((f: any) => f.id === fieldId ? { ...f, ...updates } : f)
            }))
        }));
        setCurrentForm({ ...currentForm, sections: updatedSections });
    };

    const handleRemoveField = (sectionId: string, fieldId: string) => {
        const updatedSections = currentForm.sections.map((s: any) => ({
            ...s, rows: s.rows?.map((r: any) => ({
                ...r, fields: r.fields?.filter((f: any) => f.id !== fieldId)
            }))
        }));
        setCurrentForm({ ...currentForm, sections: updatedSections });
        addToast('Champ supprimé', 'error');
    };

    const handleChangeLayout = (sectionId: string, rowId: string, newCols: number) => {
        const updatedSections = currentForm.sections.map((s: any) => {
            if (String(s.id) === String(sectionId)) {
                return { ...s, rows: s.rows.map((r: any) => r.id === rowId ? { ...r, columns: newCols, fields: r.fields.slice(0, newCols) } : r) };
            }
            return s;
        });
        setCurrentForm({ ...currentForm, sections: updatedSections });
    };

    return (
        <AppLayout form={currentForm} isFullWidth={true}>
            <Head title={`Éditeur - ${currentForm.title}`} />
            
            {showPreview && <FormPreview form={currentForm} onClose={() => setShowPreview(false)} />}
            
            {showPopupBuilder && (
                <PopupBuilder 
                    formId={currentForm.id} // On passe l'ID pour la route Laravel
                    initialData={currentForm} 
                    onClose={() => setShowPopupBuilder(false)} 
                    onSuccess={() => {
                        // Optionnel : tu peux ajouter un toast ici si Editor.tsx en gère
                        // La page se rechargera via Inertia automatiquement
                        setShowPopupBuilder(false);
                    }} 
                />
            )}

            <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className={cn("pointer-events-auto min-w-[300px] px-5 py-4 rounded-[1.25rem] shadow-2xl border flex items-center justify-between gap-4 animate-in slide-in-from-right-10 fade-in duration-300", toast.type === 'success' ? "bg-white border-zinc-100" : "bg-red-50 border-red-100")}>
                        <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", toast.type === 'success' ? "bg-cyan-50 text-[#0891b2]" : "bg-red-100 text-red-600")}>
                                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", toast.type === 'success' ? "text-[#0891b2]" : "text-red-600")}>{toast.type === 'success' ? 'Confirmation' : 'Attention'}</span>
                                <span className="text-sm font-bold text-zinc-900 tracking-tight">{toast.message}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col min-h-screen bg-[#fcfcfd]">
                <header className="sticky top-0 z-[50] h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-10 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mode Édition</div>
                        <div className="text-sm font-black text-zinc-900 tracking-tight">{currentForm.title}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowPopupBuilder(true)}
                            className="h-10 px-4 flex items-center gap-2 bg-white text-zinc-600 rounded-xl border border-zinc-200 hover:border-dark-cyan-600 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Layers size={16} /> Structure
                        </button>

                        <div className="w-px h-6 bg-zinc-100 mx-1" />

                        <button title="Exporter" className="h-10 w-10 flex items-center justify-center bg-white text-zinc-500 rounded-xl border border-zinc-200 hover:border-dark-cyan-600 transition-all"><Download size={18} /></button>
                        <button title="Imprimer" onClick={() => window.print()} className="h-10 w-10 flex items-center justify-center bg-white text-zinc-500 rounded-xl border border-zinc-200 hover:border-dark-cyan-600 transition-all"><Printer size={18} /></button>
                        
                        <button onClick={() => setShowPreview(true)} className="h-10 px-4 flex items-center gap-2 bg-white text-zinc-600 rounded-xl border border-zinc-200 hover:border-dark-cyan-600 transition-all font-black text-[10px] uppercase tracking-widest">
                            <Eye size={16} /> Preview
                        </button>
                        
                        <div className="w-px h-6 bg-zinc-100 mx-1" />
                        
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "h-10 px-6 flex items-center gap-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95",
                                isSaving ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-dark-cyan-600 text-white shadow-lg shadow-cyan-900/20 hover:bg-dark-cyan-700"
                            )}
                        >
                            <Save size={16} /> {isSaving ? 'Synchronisation...' : 'Enregistrer'}
                        </button>
                    </div>
                </header>

                <main className="p-6 md:p-10 w-full max-w-[100%] mx-auto">
                    {currentForm.sections?.map((section: any) => (
                        <CollapsibleSection 
                            key={section.id} 
                            section={section} 
                            onUpdateField={handleUpdateField} 
                            onRemoveField={handleRemoveField} 
                            onAddRow={handleAddRow}
                            onChangeLayout={handleChangeLayout}
                            onRemoveRow={handleRemoveRow}
                            onAddFieldToRow={handleAddFieldToRow}
                            onDuplicateField={handleDuplicateField}
                            onSave={handleSave}
                        />
                    ))}
                </main>
            </div>
        </AppLayout>
    );
}