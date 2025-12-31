import React, { useState, useMemo } from 'react'; // Ajout de useMemo
import { useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WilayaSelector } from "./component-users/WilayaSelector";
import { CenterFilters } from "./component-users/CenterFilters"; // Ton nouveau composant
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue
} from "@/components/ui/select";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    Plus, Building2, MapPin, Loader2, MoreVertical, Phone, Mail, 
    ShieldCheck, Landmark, ShieldHalf, AlertTriangle, User, Trash2,Pencil
} from "lucide-react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function CentersSection({ centers, users = [] }: { centers: any[], users?: any[] }) {    const [isOpen, setIsOpen] = useState(false);
    const [centerToDisable, setCenterToDisable] = useState<any | null>(null);
    const [confirmText, setConfirmText] = useState("");
    // Logique de langue (à adapter selon ton système i18n)
    const disableWord = "DESACTIVER"; // ou "DESACTIVATE"

    const [centerToDelete, setCenterToDelete] = useState<any | null>(null);
    const [confirmDeleteText, setConfirmDeleteText] = useState("");

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCenter, setEditingCenter] = useState<any | null>(null);

    const deleteWord = "SUPPRIMER"; // Ou "DELETE" selon ta logique de langue

    // --- 1. ÉTATS POUR LES FILTRES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterWilaya, setFilterWilaya] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // --- 2. LOGIQUE DE FILTRAGE ---
    const filteredCenters = useMemo(() => {
        return centers.filter(center => {
            const matchesSearch = 
                center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                center.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesWilaya = filterWilaya === 'all' || center.wilaya === filterWilaya;
            const matchesType = filterType === 'all' || center.structure_type === filterType;

            return matchesSearch && matchesWilaya && matchesType;
        });
    }, [centers, searchQuery, filterWilaya, filterType]);

    // Fonction pour réinitialiser
    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterWilaya('all');
        setFilterType('all');
    };
    
    const handleEditClick = (center: any) => {
    setEditingCenter(center);
    setIsEditMode(true);
    
    // On remplit le formulaire avec les valeurs actuelles
    setData({
        name: center.name || '',
        code: center.code || '',
        wilaya: center.wilaya || '',
        phone: center.phone || '',
        email: center.email || '',
        structure_type: center.structure_type || '',
        service_name: center.service_name || '',
        head_of_service: center.head_of_service || '',
    });
    
    setIsOpen(true); // Ouvre le Dialog
    };

    // --- FORMULAIRE D'AJOUT ---
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        wilaya: '',
        phone: '',
        email: '',
        structure_type: '',
        service_name: '',
        head_of_service: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditMode && editingCenter) {
            // Mode ÉDITION (Laravel attend souvent un PUT ou PATCH)
            post((window as any).route('centers.update', editingCenter.id), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                    setIsEditMode(false);
                    setEditingCenter(null);
                },
            });
        } else {
            // Mode AJOUT
            post((window as any).route('centers.store'), {
                onSuccess: () => {
                    reset();
                    setIsOpen(false);
                },
            });
        }
    };

    const handleAddNew = () => {
    setIsEditMode(false);      // On repasse en mode création
    setEditingCenter(null);    // On retire le centre en cours d'édition
    reset();                   // On vide tous les champs du formulaire (via useForm)
    setIsOpen(true);           // On ouvre le modal
    };

    const getStructureStyle = (type: string) => {
        switch (type) {
            case 'public': return "bg-blue-50 text-blue-700 border-blue-100";
            case 'military': return "bg-slate-100 text-slate-700 border-slate-200";
            case 'private': return "bg-amber-50 text-amber-700 border-amber-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    // Déclenche l'action (soit réactive direct, soit ouvre le popup pour désactiver)
    const handleToggleStatus = (center: any) => {
        if (center.status === 'inactive') {
            // Réactivation directe (pas besoin de confirmation compliquée)
            post((window as any).route('centers.toggle', center.id));
        } else {
            // Ouverture du popup pour désactivation
            setCenterToDisable(center);
        }
    };

    // La fonction appelée après avoir tapé le mot de confirmation
    const handleConfirmDisable = () => {
        if (centerToDisable) {
            post((window as any).route('centers.toggle', centerToDisable.id), {
                onSuccess: () => {
                    setCenterToDisable(null);
                    setConfirmText("");
                }
            });
        }
    };

    // 1. Ouvre le popup de suppression
    const handleDeleteClick = (center: any) => {
        setCenterToDelete(center);
    };

    // 2. Exécute la suppression réelle vers Laravel
    const handleConfirmDelete = () => {
        if (centerToDelete) {
            post((window as any).route('admin.settings.centers.delete', centerToDelete.id), {
                onSuccess: () => {
                    setCenterToDelete(null);
                    setConfirmDeleteText("");
                },
                preserveScroll: true
            });
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-dark-cyan-50/50 bg-slate-50/20">
                <div>
                    <span className="text-xs font-bold text-dark-cyan-600 uppercase tracking-widest">Répertoire</span>
                    <p className="text-sm text-slate-500">
                        {filteredCenters.length} structures trouvées sur {centers.length}
                    </p>
                </div>
                
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            onClick={handleAddNew} // Appelle notre fonction de nettoyage
                            className="bg-dark-cyan-700 hover:bg-dark-cyan-800 text-white rounded-xl gap-2 shadow-lg shadow-dark-cyan-100 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau Centre
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
                        {/* ... Contenu du Dialog (inchangé) ... */}
                        <div className="bg-dark-cyan-700 p-6 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    Configuration Centre
                                </DialogTitle>

                                <DialogDescription className="text-dark-cyan-100/70 text-sm mt-1">
                                    {isEditMode 
                                        ? "Mettez à jour les informations relatives à cette structure." 
                                        : "Remplissez le formulaire pour enregistrer un nouveau centre dans le répertoire."}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                                {/* --- Section 1: Centre (Déjà existante) --- */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-slate-900">Nom du centre</Label>
                                        <Input 
                                            placeholder="ex: CHU de Bab El Oued"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="rounded-lg border-slate-200 h-10"
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-slate-900">Code Unique</Label>
                                        <Input 
                                            placeholder="ex: CHU-01"
                                            value={data.code}
                                            onChange={e => setData('code', e.target.value)}
                                            className="font-mono rounded-lg border-slate-200 h-10 uppercase"
                                        />
                                    </div>
                                </div>

                                {/* --- Section 2: Localisation & Type (Déjà existante) --- */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-slate-900">Wilaya</Label>
                                        <WilayaSelector value={data.wilaya} onChange={(name) => setData('wilaya', name)} error={errors.wilaya} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-slate-900">Type de structure</Label>
                                        <Select value={data.structure_type} onValueChange={(val) => setData('structure_type', val)}>
                                            <SelectTrigger className="h-10 w-full rounded-lg border border-slate-200 bg-white">
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                                                <SelectItem value="public">Secteur Public</SelectItem>
                                                <SelectItem value="private">Secteur Privé</SelectItem>
                                                <SelectItem value="military">Secteur Militaire</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* --- NOUVELLE SECTION : SERVICE & RESPONSABLE --- */}
                                <div className="pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations Service</span>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>

                                    <div className="space-y-1.5 mb-4">
                                        <Label className="text-[11px] font-bold uppercase text-slate-900">Nom du Service (ECRF)</Label>
                                        <Input 
                                            placeholder="ex: Service de Gastro-entérologie"
                                            value={data.service_name}
                                            onChange={e => setData('service_name', e.target.value)}
                                            className="rounded-lg border-slate-200 h-10"
                                        />
                                        {errors.service_name && <p className="text-[10px] text-red-500 font-medium">{errors.service_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold uppercase text-slate-900">Chef de Service</Label>
                                            <Select value={data.head_of_service} onValueChange={(val) => setData('head_of_service', val)}>
                                                <SelectTrigger className="h-10 w-full rounded-lg border border-slate-200 bg-white">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                    <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                                                        {users.map((user: any) => (
                                                            <SelectItem key={user.id} value={user.name}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="p-1 bg-slate-100 rounded-md">
                                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                                                        {/* Optionnel : vous pouvez ajouter l'email en tout petit dessous */}
                                                                        <span className="text-[9px] text-slate-400 -mt-1">{user.email}</span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                            </Select>
                                            {errors.head_of_service && <p className="text-[10px] text-red-500 font-medium">{errors.head_of_service}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-bold uppercase text-slate-900">Téléphone Direct</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <Input 
                                                    placeholder="05XXXXXXXX"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    className="pl-9 rounded-lg border-slate-200 h-10"
                                                />
                                            </div>
                                            {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={processing} className="w-full h-11 bg-dark-cyan-700 hover:bg-dark-cyan-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98]">
                                        {processing ? <Loader2 className="animate-spin w-5 h-5" /> : "Finaliser la Configuration"}
                                    </Button>
                                </div>
                            </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* --- 3. INSERTION DU COMPOSANT DE FILTRES --- */}
            <CenterFilters 
                search={searchQuery}
                onSearchChange={setSearchQuery}
                wilaya={filterWilaya}
                onWilayaChange={setFilterWilaya}
                type={filterType}
                onTypeChange={setFilterType}
                onReset={handleResetFilters}
            />

            {/* Tableau */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[120px] pl-6 font-bold text-slate-500 text-[10px] uppercase tracking-tighter">ID Code</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-tighter">Structure & Contact</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-tighter text-center">Type</TableHead>
                            <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-tighter">Localisation</TableHead>
                            <TableHead className="w-[80px] text-right pr-6 font-bold text-slate-500 text-[10px] uppercase tracking-tighter">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                        <TableBody>
                            {filteredCenters.map((center) => {
                                // Détection de l'état pour le style
                                const isInactive = center.status === 'inactive';

                                return (
                                    <TableRow 
                                        key={center.id} 
                                        className={`group hover:bg-dark-cyan-50/20 transition-all border-slate-100 ${
                                            isInactive ? "opacity-60 grayscale-[0.6] bg-slate-50/50" : ""
                                        }`}
                                    >
                                        <TableCell className="pl-6">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded-md border border-slate-200">
                                                {center.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-dark-cyan-950 text-sm group-hover:text-dark-cyan-700 transition-colors">
                                                    {center.name} {isInactive && <span className="text-[10px] font-normal text-slate-400 ml-2">(Désactivé)</span>}
                                                </span>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {center.email && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Mail className="w-3 h-3 text-slate-300" /> {center.email}
                                                        </span>
                                                    )}
                                                    {center.phone && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Phone className="w-3 h-3 text-slate-300" /> {center.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${getStructureStyle(center.structure_type)}`}>
                                                <ShieldCheck className="w-3 h-3" />
                                                {center.structure_type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                                                <div className="p-1.5 bg-red-50 text-red-500 rounded-md">
                                                    <MapPin className="w-3 h-3" />
                                                </div>
                                                {center.wilaya}
                                            </div>
                                        </TableCell>
                                        
                                        {/* COLONNE ACTIONS MODIFIÉE */}
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end items-center gap-3"> {/* Gap augmenté à 3 */}
                                                    
                                                    {/* BOUTON ACTIVER / DÉSACTIVER */}
                                                    <Button
                                                        variant="secondary" // On passe en secondary pour avoir un fond
                                                        size="sm" // Un peu plus grand pour la lisibilité
                                                        onClick={() => handleToggleStatus(center)}
                                                        className={`h-9 px-3 flex items-center gap-2 rounded-xl transition-all shadow-sm border ${
                                                            isInactive 
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white" 
                                                            : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-500 hover:text-white"
                                                        }`}
                                                    >
                                                        {isInactive ? (
                                                            <>
                                                                <ShieldCheck className="w-4 h-4" />
                                                                <span className="text-[11px] font-bold uppercase tracking-wider">Réactiver</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldHalf className="w-4 h-4" />
                                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-inherit">Désactiver</span>
                                                            </>
                                                        )}
                                                    </Button>

                                                    {/* BOUTON SUPPRIMER */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(center)} // On passe l'objet center entier
                                                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> 
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-dark-cyan-600 hover:bg-dark-cyan-50 transition-colors"
                                                        onClick={() => handleEditClick(center)} // <--- Appel de la fonction
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredCenters.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-400 italic">
                                        Aucune structure ne correspond à vos filtres.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                </Table>
                <AlertDialog 
                    open={!!centerToDisable} 
                    onOpenChange={(open) => {
                        if (!open) {
                            setCenterToDisable(null);
                            setConfirmText("");
                        }
                    }}
                >
                    <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-orange-400 flex items-center gap-2">
                                <ShieldHalf className="w-5 h-5 text-amber-500" />
                                Désactiver le centre ?
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 pt-2">
                                    
                                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                                        <p className="text-sm text-orange-600 leading-relaxed">
                                            Vous êtes sur le point de désactiver <strong>{centerToDisable?.name}</strong>.
                                            Il ne sera plus visible pour les nouvelles opérations, mais ses données historiques seront conservées.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                            Tapez <span className="text-orange-400">"{disableWord}"</span> pour confirmer
                                        </p>
                                        <Input 
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder={disableWord}
                                            className="h-11 text-center font-bold tracking-widest focus:ring-amber-500 border-slate-200 uppercase"
                                        />
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel asChild>
                                <Button variant="ghost" className="font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none shadow-none rounded-xl transition-colors">
                                    Annuler
                                </Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button
                                    onClick={() => handleConfirmDisable()}
                                    disabled={confirmText.toUpperCase() !== disableWord}
                                    className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl font-bold px-6 disabled:opacity-30 transition-all shadow-lg shadow-amber-100"
                                >
                                    Confirmer la désactivation
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL DE SUPPRESSION DÉFINITIVE */}
                <AlertDialog 
                    open={!!centerToDelete} 
                    onOpenChange={(open) => {
                        if (!open) {
                            setCenterToDelete(null);
                            setConfirmDeleteText("");
                        }
                    }}
                >
                    <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Supprimer définitivement ?
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 pt-2">
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-sm text-red-700 leading-relaxed">
                                            Attention : L'action est irréversible. Toutes les données liées au centre <strong>{centerToDelete?.name}</strong> seront effacées.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                            Tapez <span className="text-red-600">"{deleteWord}"</span> pour confirmer
                                        </p>
                                        <Input 
                                            value={confirmDeleteText}
                                            onChange={(e) => setConfirmDeleteText(e.target.value)}
                                            placeholder={deleteWord}
                                            className="h-11 text-center font-bold tracking-widest focus:ring-red-500 border-slate-200 uppercase"
                                        />
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel asChild>
                                <Button variant="ghost" className="font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none shadow-none rounded-xl transition-colors">
                                    Annuler
                                </Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button
                                    onClick={() => handleConfirmDelete()}
                                    disabled={confirmDeleteText.toUpperCase() !== deleteWord}
                                    className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold px-6 disabled:opacity-30 transition-all shadow-lg shadow-red-100"
                                >
                                    Supprimer le centre
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}