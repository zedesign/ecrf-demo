import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { format, startOfDay } from "date-fns";
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
import { 
    FileText, ShieldCheck, Beaker, CalendarIcon, 
    Info, PlusCircle, Loader2, Building2, 
    Stethoscope, Search, UserCircle, ChevronDown, Check,
    Layout, Target, Activity, X
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

// --- CONFIGURATION DES STYLES ---
const FIELD_STYLE = "min-h-11 w-full border border-input bg-background rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-[#0891b2] transition-all font-sans text-foreground py-2";
const DROPDOWN_STYLE = "w-[var(--radix-popover-trigger-width)] p-0 border border-border shadow-2xl rounded-xl z-[160] overflow-hidden";
const ITEM_HOVER = "hover:bg-[#0891b2]/10 hover:text-dark-cyan-800 transition-colors cursor-pointer text-foreground";

export default function CreateStudyModal({ isOpen, onClose, centers = [], users = [] }: any) {
    const [centerSearch, setCenterSearch] = useState("");
    const [sponsorSearch, setSponsorSearch] = useState("");
    
    const [isSponsorOpen, setIsSponsorOpen] = useState(false);
    const [isCentersOpen, setIsCentersOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isPhaseOpen, setIsPhaseOpen] = useState(false);
    const [isAreaOpen, setIsAreaOpen] = useState(false);

    const today = startOfDay(new Date());
    const [startDateMonth, setStartDateMonth] = useState<Date>(new Date());
    const [protocolDateMonth, setProtocolDateMonth] = useState<Date>(new Date());

    const { data, setData, post, processing, reset, transform } = useForm({
        name: '',
        protocol_code: '',
        protocol_version: '1.0',
        protocol_date: new Date() as Date | undefined,
        start_date: undefined as Date | undefined,
        phase: 'Phase III',
        target_inclusions: 0,
        therapeutic_area: '',
        sponsor_id: '',
        selected_centers: [] as number[],
        status: 'Draft'
    });

    const filteredSponsors = (users || []).filter((u: any) => {
        const hasSponsorRole = u.roles?.some((r: any) => 
            r.name === 'study_admin' || r.name?.toLowerCase().includes('sponsor') || r.name === 'super_admin'
        );
        return hasSponsorRole && (u.name || "").toLowerCase().includes(sponsorSearch.toLowerCase());
    });

    const filteredCenters = (centers || []).filter((c: any) => 
        c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        c.code?.toLowerCase().includes(centerSearch.toLowerCase())
    );

    const selectedSponsor = users.find((u: any) => u.id.toString() === data.sponsor_id.toString());
    const currentStatus = STUDY_STATUSES.find(s => s.value === data.status);

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
        transform((oldData) => ({
            ...oldData,
            start_date: oldData.start_date ? format(oldData.start_date, "yyyy-MM-dd") : null,
            protocol_date: oldData.protocol_date ? format(oldData.protocol_date, "yyyy-MM-dd") : null,
        }));
        post(route('studies.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl bg-background rounded-2xl font-sans">
                <form onSubmit={submit}>
                    <div className="relative p-8 text-white bg-dark-cyan-700">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-widest uppercase text-white">
                                        Nouvelle étude clinique
                                    </DialogTitle>
                                    <DialogDescription className="text-white/80 font-medium">
                                        Initialisation des paramètres de recherche clinique.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6 bg-background max-h-[65vh] overflow-y-auto custom-scrollbar">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <FileText className="w-4 h-4" /> Nom de l'étude
                                </Label>
                                <Input className={FIELD_STYLE.replace("min-h-11", "h-11")} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="ex: Étude de phase III..." required />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <ShieldCheck className="w-4 h-4" /> Code Protocole
                                </Label>
                                <Input className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "font-bold uppercase")} value={data.protocol_code} onChange={e => setData('protocol_code', e.target.value.toUpperCase().replace(/\s+/g, '_'))} placeholder="ex: CT_2024_001" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <CalendarIcon className="w-4 h-4" /> Date de début prévue
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "justify-start font-normal px-3")}>
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {data.start_date ? format(data.start_date, "dd/MM/yyyy", { locale: fr }) : <span className="text-muted-foreground">ex: 15/01/2025</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[170] rounded-xl overflow-hidden border-border shadow-2xl" style={{ backgroundColor: 'var(--card)' }} align="center">
                                        <Calendar mode="single" selected={data.start_date} onSelect={(d) => setData('start_date', d)} month={startDateMonth} onMonthChange={setStartDateMonth} locale={fr} disabled={(date) => date < today} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <Activity className="w-4 h-4" /> Statut de l'étude
                                </Label>
                                <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "justify-between px-3 font-normal")}>
                                            <span>{currentStatus?.label || "Sélectionner..."}</span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} style={{ backgroundColor: 'var(--card)' }} align="start" sideOffset={4}>
                                        <div className="flex flex-col p-1">
                                            {STUDY_STATUSES.map(s => (
                                                <button key={s.value} type="button" onClick={() => { setData('status', s.value); setIsStatusOpen(false); }} className={cn("flex items-center justify-between px-3 py-2.5 text-sm rounded-lg", ITEM_HOVER)}>
                                                    {s.label}
                                                    {data.status === s.value && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <Target className="w-4 h-4" /> Objectif d'inclusions
                                </Label>
                                <Input type="number" className={FIELD_STYLE.replace("min-h-11", "h-11")} value={data.target_inclusions} onChange={e => setData('target_inclusions', parseInt(e.target.value) || 0)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border rounded-2xl bg-dark-cyan-50">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <UserCircle className="w-4 h-4" /> Promoteur (Sponsor)
                                </Label>
                                <Popover open={isSponsorOpen} onOpenChange={setIsSponsorOpen}>
                                    <PopoverTrigger asChild>
                                        <div className={cn(FIELD_STYLE, "bg-background px-3 flex items-center cursor-pointer pr-10 relative overflow-hidden")}>
                                            {selectedSponsor ? (
                                                <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-[#0891b2]/10 text-[#0891b2] border border-[#0891b2]/20 rounded-md text-[11px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-[#0891b2] text-white flex items-center justify-center text-[8px] font-black">
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
                                    <PopoverContent className={DROPDOWN_STYLE} style={{ backgroundColor: 'var(--card)' }} align="start" sideOffset={4}>
                                        <div className="p-3 bg-[#0891b2]/5 border-b border-border/50">
                                            <div className="flex items-center px-3 h-9 rounded-lg bg-background/50 border border-input focus-within:ring-1 focus-within:ring-[#0891b2]/30 transition-all">
                                                <Search className="w-3.5 h-3.5 mr-2 text-[#0891b2]/50" />
                                                <input className="text-xs w-full outline-none bg-transparent text-foreground placeholder:text-muted-foreground/50" placeholder="Rechercher..." value={sponsorSearch} onChange={(e) => setSponsorSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="max-h-[180px] overflow-y-auto p-1 custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
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
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-dark-cyan-800">
                                    <Building2 className="w-4 h-4" /> Centres ({data.selected_centers.length})
                                </Label>
                                <Popover open={isCentersOpen} onOpenChange={setIsCentersOpen}>
                                    <PopoverTrigger asChild>
                                        <div className={cn(FIELD_STYLE, "bg-background px-3 flex flex-wrap gap-1.5 cursor-pointer items-center pr-10 relative overflow-hidden")}>
                                            {data.selected_centers.length > 0 ? (
                                                data.selected_centers.map(id => {
                                                    const c = centers.find((center: any) => center.id === id);
                                                    return (
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0891b2]/10 text-dark-cyan-800 border border-[#0891b2]/20 rounded-md text-[11px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200">
                                                            {c?.name}
                                                            <X className="w-3 h-3 transition-colors" onClick={(e) => removeCenter(e, id)} />
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Sélectionner...</span>
                                            )}
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} style={{ backgroundColor: 'var(--card)' }} align="start" sideOffset={4}>
                                        <div className="p-3 bg-[#0891b2]/5 border-b border-border/50">
                                            <div className="flex items-center px-3 h-9 rounded-lg bg-background/50 border border-input focus-within:ring-1 focus-within:ring-[#0891b2]/30 transition-all">
                                                <Search className="w-3.5 h-3.5 mr-2 text-[#0891b2]/50" />
                                                <input className="text-xs w-full outline-none bg-transparent text-foreground placeholder:text-muted-foreground/50" placeholder="Filtrer..." value={centerSearch} onChange={(e) => setCenterSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto p-1 custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
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

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Beaker className="w-4 h-4" /> Phase</Label>
                                <Popover open={isPhaseOpen} onOpenChange={setIsPhaseOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "justify-between px-3 font-normal")}>
                                            <span className="text-foreground">{data.phase || "Choisir..."}</span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} style={{ backgroundColor: 'var(--card)' }} align="start">
                                        <div className="flex flex-col p-1" onWheel={(e) => e.stopPropagation()}>
                                            {PHASES.map(p => (
                                                <button key={p} type="button" onClick={() => { setData('phase', p); setIsPhaseOpen(false); }} className={cn("flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left", ITEM_HOVER)}>
                                                    {p}
                                                    {data.phase === p && <Check className="w-4 h-4" />}
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
                                        <Button variant="outline" className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "justify-between px-3 font-normal")}>
                                            <span className="truncate text-foreground">{data.therapeutic_area || "Choisir..."}</span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={cn(DROPDOWN_STYLE)} style={{ backgroundColor: 'var(--card)' }} align="start">
                                        <div className="flex flex-col p-1 max-h-64 overflow-y-auto custom-scrollbar" onWheel={(e) => e.stopPropagation()}>
                                            {THERAPEUTIC_AREAS.map(area => (
                                                <button key={area} type="button" onClick={() => { setData('therapeutic_area', area); setIsAreaOpen(false); }} className={cn("flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left", ITEM_HOVER)}>
                                                    {area}
                                                    {data.therapeutic_area === area && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Info className="w-4 h-4" /> Version du protocole</Label>
                                <Input className={FIELD_STYLE.replace("min-h-11", "h-11")} value={data.protocol_version} onChange={e => setData('protocol_version', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground"><Layout className="w-4 h-4" /> Date de version</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn(FIELD_STYLE.replace("min-h-11", "h-11"), "justify-start font-normal px-3")}>
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {data.protocol_date ? format(data.protocol_date, "dd/MM/yyyy", { locale: fr }) : <span className="text-muted-foreground">Choisir...</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[170] rounded-xl border-border shadow-2xl" style={{ backgroundColor: 'var(--card)' }} align="center">
                                        <Calendar mode="single" selected={data.protocol_date} onSelect={(d) => setData('protocol_date', d)} month={protocolDateMonth} onMonthChange={setProtocolDateMonth} locale={fr} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-muted/10 border-t border-border flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-8 font-black uppercase text-[11px] tracking-widest text-muted-foreground hover:bg-muted transition-colors">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-dark-cyan-700 hover:opacity-90 text-white h-12 px-10 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-95">
                            {processing ? <Loader2 className="animate-spin mr-2" /> : "Lancer l'étude"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}