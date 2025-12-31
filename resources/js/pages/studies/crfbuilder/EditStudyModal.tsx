import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { 
    FileText, ShieldCheck, Beaker, CalendarIcon, 
    AlertCircle, Loader2, Building2, 
    Stethoscope, Search, UserCircle, ChevronDown, Check,
    Target, Activity, History, X
} from 'lucide-react';
import { cn } from "@/lib/utils";

const THERAPEUTIC_AREAS = [
    "Oncologie", "Cardiologie", "Neurologie", "Infectiologie", "Endocrinologie",
    "Gastro-entérologie", "Pneumologie", "Hématologie", "Rhumatologie", "Dermatologie",
    "Ophtalmologie", "Psychiatrie", "Gynécologie", "Pédiatrie", "Urologie", "Néphrologie"
];

const STUDY_STATUSES = [
    { value: "Draft", label: "Brouillon" },
    { value: "Active", label: "En cours" },
    { value: "Paused", label: "En attente" },
    { value: "Closed", label: "Clôturée" },
    { value: "Archived", label: "Archivée" }
];

const PHASES = ["Phase I", "Phase II", "Phase III", "Phase IV", "Observational"];

// --- STYLES ---
const FIELD_STYLE = "min-h-11 w-full border border-input bg-background rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-orange-500/50 transition-all font-sans text-foreground py-2";
const DROPDOWN_STYLE = "w-[var(--radix-popover-trigger-width)] p-0 border border-border shadow-2xl rounded-xl z-[160] overflow-hidden";
const ITEM_HOVER = "hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer text-foreground";

export default function EditStudyModal({ isOpen, onClose, study, centers = [], users = [] }: any) {
    const [centerSearch, setCenterSearch] = useState("");
    const [sponsorSearch, setSponsorSearch] = useState("");
    const [areaSearch, setAreaSearch] = useState(""); 
    
    const [isSponsorOpen, setIsSponsorOpen] = useState(false);
    const [isCentersOpen, setIsCentersOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isPhaseOpen, setIsPhaseOpen] = useState(false);
    const [isAreaOpen, setIsAreaOpen] = useState(false);

    const { data, setData, put, processing, transform } = useForm({
        name: '',
        protocol_code: '',
        protocol_version: '',
        protocol_date: '',
        start_date: undefined as Date | undefined,
        phase: '',
        target_inclusions: 0,
        therapeutic_area: '',
        sponsor_id: '',
        selected_centers: [] as number[],
        status: '',
        edit_reason: '',
    });

    useEffect(() => {
        if (study && isOpen) {
            let dateObj: Date | undefined = undefined;
            if (study.start_date) {
                const parsed = new Date(study.start_date);
                if (!isNaN(parsed.getTime())) dateObj = parsed;
            }

            setData({
                name: study.name || '',
                protocol_code: study.protocol_code || '',
                protocol_version: study.protocol_version?.toString() || '1.0',
                protocol_date: study.protocol_date || '',
                start_date: dateObj,
                phase: study.phase || '',
                target_inclusions: study.target_inclusions || 0,
                therapeutic_area: study.therapeutic_area || '',
                sponsor_id: study.sponsor_id?.toString() || '',
                selected_centers: Array.isArray(study.centers) ? study.centers.map((c: any) => c.id) : [],
                status: study.status || 'Draft',
                edit_reason: '', 
            });
        }
    }, [study, isOpen]);

    const filteredSponsors = (users || []).filter((u: any) => 
        u.name?.toLowerCase().includes(sponsorSearch.toLowerCase())
    );
    const filteredCenters = (centers || []).filter((c: any) => 
        c.name.toLowerCase().includes(centerSearch.toLowerCase())
    );
    
    const filteredAreas = THERAPEUTIC_AREAS.filter(a => 
        a.toLowerCase().includes(areaSearch.toLowerCase())
    );

    const selectedSponsor = users.find((u: any) => u.id.toString() === data.sponsor_id.toString());

    const toggleCenter = (centerId: number) => {
        const current = [...data.selected_centers];
        const index = current.indexOf(centerId);
        index > -1 ? current.splice(index, 1) : current.push(centerId);
        setData('selected_centers', current);
    };

    const removeCenter = (e: React.MouseEvent, centerId: number) => {
        e.stopPropagation();
        setData('selected_centers', data.selected_centers.filter(id => id !== centerId));
    };

    const removeSponsor = (e: React.MouseEvent) => {
        e.stopPropagation();
        setData('sponsor_id', '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((oldData) => {
            const currentVersion = parseFloat(oldData.protocol_version) || 1.0;
            const nextVersion = (currentVersion + 0.1).toFixed(1);
            const today = format(new Date(), "yyyy-MM-dd");
            const { protocol_code, ...rest } = oldData;
            return {
                ...rest,
                protocol_version: nextVersion,
                protocol_date: today,
                start_date: oldData.start_date ? format(oldData.start_date, "yyyy-MM-dd") : null,
            };
        });

        put(route('studies.update', study.id), {
            preserveState: true,
            onSuccess: () => onClose(),
        });
    };

    const nextVersionPreview = (parseFloat(data.protocol_version) + 0.1).toFixed(1);

    if (!study) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl bg-background rounded-2xl font-sans">
                <form onSubmit={submit}>
                    <div className="relative p-8 text-white bg-orange-600">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-widest uppercase">
                                        Édition : {study.protocol_code}
                                    </DialogTitle>
                                    <DialogDescription className="text-orange-100 font-medium italic">
                                        Incrémentation automatique vers la version {nextVersionPreview}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6 bg-background max-h-[65vh] overflow-y-auto custom-scrollbar">
                        
                        {/* Ligne 1 : Raison */}
                        <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-3">
                            <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                <History className="w-4 h-4" /> Raison de la modification
                            </Label>
                            <Textarea 
                                required 
                                placeholder="Précisez les changements..."
                                className="bg-background border-orange-500/20 min-h-[80px] rounded-xl focus-visible:ring-orange-500/50"
                                value={data.edit_reason}
                                onChange={e => setData('edit_reason', e.target.value)}
                            />
                        </div>

                        {/* Ligne 2 : Nom étude */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                <FileText className="w-4 h-4" /> Nom de l'étude
                            </Label>
                            <Input className={FIELD_STYLE} value={data.name} onChange={e => setData('name', e.target.value)} required />
                        </div>

                        {/* Ligne 3 : Code protocole & date début */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground opacity-70">
                                    <ShieldCheck className="w-4 h-4" /> Code Protocole
                                </Label>
                                <Input className={cn(FIELD_STYLE, "font-bold bg-muted/30 cursor-not-allowed px-3")} value={data.protocol_code} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                    <CalendarIcon className="w-4 h-4" /> Date de début
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE, "justify-start px-3 font-normal")}>
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {data.start_date ? format(data.start_date, "dd/MM/yyyy", { locale: fr }) : "Non définie"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[170] bg-card rounded-xl border border-border" align="center">
                                        <Calendar mode="single" selected={data.start_date} onSelect={(d) => setData('start_date', d)} locale={fr} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Ligne 4 : Status & objectif d'inclusion */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                    <Activity className="w-4 h-4" /> Statut
                                </Label>
                                <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE, "justify-between px-3")}>
                                            <span className="text-foreground font-normal">
                                                {STUDY_STATUSES.find(s => s.value === data.status)?.label || "Choisir le statut"}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start">
                                        <div className="flex flex-col p-1 bg-card">
                                            {STUDY_STATUSES.map(s => (
                                                <button key={s.value} type="button" onClick={() => { setData('status', s.value); setIsStatusOpen(false); }} className={cn("flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left", ITEM_HOVER)}>
                                                    {s.label} {data.status === s.value && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                    <Target className="w-4 h-4" /> Inclusions Cibles
                                </Label>
                                <Input 
                                    type="number" 
                                    className={FIELD_STYLE + " px-3"} 
                                    value={data.target_inclusions} 
                                    onChange={e => setData('target_inclusions', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                        </div>

                        {/* Ligne 5 : Sponsors & Centers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border rounded-2xl bg-secondary/20">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                    <UserCircle className="w-4 h-4" /> Promoteur (Sponsor)
                                </Label>
                                <Popover open={isSponsorOpen} onOpenChange={setIsSponsorOpen}>
                                    <PopoverTrigger asChild>
                                        <div className={cn(FIELD_STYLE, "bg-background px-3 flex items-center cursor-pointer pr-10 relative overflow-hidden")}>
                                            {selectedSponsor ? (
                                                <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-orange-600/10 text-orange-600 border border-orange-600/20 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[8px] font-black">
                                                        {selectedSponsor.name.charAt(0)}
                                                    </div>
                                                    {selectedSponsor.name}
                                                    <X className="w-3 h-3 hover:text-red-500 transition-colors" onClick={(e) => removeSponsor(e)} />
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Sélectionner...</span>
                                            )}
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start" sideOffset={4}>
                                        <div className="p-3 bg-orange-600/5 border-b border-border/50">
                                            <div className="flex items-center px-3 h-9 rounded-lg bg-background/50 border border-input focus-within:ring-1 focus-within:ring-orange-600/30">
                                                <Search className="w-3.5 h-3.5 mr-2 text-orange-600/50" />
                                                <input className="text-xs w-full outline-none bg-transparent" placeholder="Rechercher..." value={sponsorSearch} onChange={(e) => setSponsorSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div 
                                            className="max-h-[180px] overflow-y-auto p-1 custom-scrollbar"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {filteredSponsors.map((user: any) => (
                                                <button key={user.id} type="button" onClick={() => { setData('sponsor_id', user.id.toString()); setIsSponsorOpen(false); }} className={cn("w-full flex items-center justify-between p-2 rounded-lg text-left", ITEM_HOVER)}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">{user.name.charAt(0)}</div>
                                                        <span className="text-sm font-medium">{user.name}</span>
                                                    </div>
                                                    {data.sponsor_id.toString() === user.id.toString() && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-orange-600">
                                    <Building2 className="w-4 h-4" /> Centres ({data.selected_centers.length})
                                </Label>
                                <Popover open={isCentersOpen} onOpenChange={setIsCentersOpen}>
                                    <PopoverTrigger asChild>
                                        <div className={cn(FIELD_STYLE, "bg-background px-3 flex flex-wrap gap-1.5 cursor-pointer items-center pr-10 relative overflow-hidden")}>
                                            {data.selected_centers.length > 0 ? (
                                                data.selected_centers.map(id => {
                                                    const c = centers.find((center: any) => center.id === id);
                                                    return (
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-600/10 text-orange-600 border border-orange-600/20 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                                            {c?.name}
                                                            <X className="w-3 h-3 hover:text-red-500 transition-colors" onClick={(e) => removeCenter(e, id)} />
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Sélectionner...</span>
                                            )}
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start" sideOffset={4}>
                                        <div className="p-3 bg-orange-600/5 border-b border-border/50">
                                            <div className="flex items-center px-3 h-9 rounded-lg bg-background/50 border border-input focus-within:ring-1 focus-within:ring-orange-600/30">
                                                <Search className="w-3.5 h-3.5 mr-2 text-orange-600/50" />
                                                <input className="text-xs w-full outline-none bg-transparent" placeholder="Filtrer..." value={centerSearch} onChange={(e) => setCenterSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div 
                                            className="max-h-[220px] overflow-y-auto p-1 custom-scrollbar"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {filteredCenters.map((center: any) => (
                                                <div key={center.id} onClick={() => toggleCenter(center.id)} className={cn("flex items-start gap-3 p-2 rounded-lg cursor-pointer", ITEM_HOVER)}>
                                                    <div className="pt-0.5"><Checkbox checked={data.selected_centers.includes(center.id)} onCheckedChange={() => toggleCenter(center.id)} className="border-current" /></div>
                                                    <div className="flex-1 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Building2 size={16} /></div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[13px] font-bold leading-none mb-1 truncate">{center.name}</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">CODE: {center.code || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Ligne 6 : Phase & Aire thérapeutique */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Beaker className="w-4 h-4" /> Phase</Label>
                                <Popover open={isPhaseOpen} onOpenChange={setIsPhaseOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE, "justify-between px-3")}>
                                            <span className="text-foreground font-normal">{data.phase || "Choisir..."}</span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start">
                                        <div 
                                            className="flex flex-col p-1 bg-card max-h-[200px] overflow-y-auto custom-scrollbar"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {PHASES.map(p => (
                                                <button key={p} type="button" onClick={() => { setData('phase', p); setIsPhaseOpen(false); }} className={cn("flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left", ITEM_HOVER)}>
                                                    {p} {data.phase === p && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Stethoscope className="w-4 h-4" /> Aire Thérapeutique</Label>
                                <Popover open={isAreaOpen} onOpenChange={setIsAreaOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE, "justify-between px-3")}>
                                            <span className="truncate text-foreground font-normal">{data.therapeutic_area || "Choisir..."}</span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start">
                                        <div className="p-3 bg-orange-600/5 border-b border-border/50">
                                            <div className="flex items-center px-3 h-9 rounded-lg bg-background/50 border border-input focus-within:ring-1 focus-within:ring-orange-600/30">
                                                <Search className="w-3.5 h-3.5 mr-2 text-orange-600/50" />
                                                <input className="text-xs w-full outline-none bg-transparent" placeholder="Filtrer..." value={areaSearch} onChange={(e) => setAreaSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div 
                                            className="max-h-60 overflow-y-auto p-1 custom-scrollbar"
                                            onWheel={(e) => e.stopPropagation()}
                                        >
                                            {filteredAreas.map(area => (
                                                <button key={area} type="button" onClick={() => { setData('therapeutic_area', area); setIsAreaOpen(false); }} className={cn("w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left", ITEM_HOVER)}>
                                                    {area} {data.therapeutic_area === area && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Footer Info Versioning */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-orange-600/5 rounded-2xl border border-orange-600/20 border-dashed">
                            <div>
                                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Nouvelle Version prévue</Label>
                                <div className="text-xl font-mono font-black text-orange-600 mt-1">{nextVersionPreview}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Date de mise à jour</Label>
                                <div className="text-xl font-bold text-foreground mt-1">{format(new Date(), "dd/MM/yyyy")}</div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-muted/10 border-t border-border flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-8 font-black uppercase text-[11px] tracking-widest text-muted-foreground hover:bg-muted transition-colors">
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !data.edit_reason} 
                            className="bg-orange-600 hover:bg-orange-700 text-white h-12 px-10 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="animate-spin mr-2" /> : "Enregistrer & Incrémenter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}