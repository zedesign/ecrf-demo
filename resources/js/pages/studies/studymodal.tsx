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
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
    FileText, ShieldCheck, Beaker, CalendarIcon, 
    Info, PlusCircle, AlertCircle, Loader2, Building2, 
    Stethoscope, Search, UserCircle, ChevronDown, Check,
    Layout, Target, Activity
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Constantes pour les options
const THERAPEUTIC_AREAS = [
    "Oncologie", "Cardiologie", "Neurologie", "Infectiologie", "Endocrinologie",
    "Gastro-entérologie", "Pneumologie", "Hématologie", "Rhumatologie", "Dermatologie",
    "Ophtalmologie", "Psychiatrie", "Gynécologie", "Pédiatrie", "Urologie", "Néphrologie"
];

const STUDY_STATUSES = [
    { value: "Draft", label: "Brouillon" },
    { value: "Active", label: "En cours" },
    { value: "Completed", label: "Terminée" },
    { value: "On Hold", label: "En pause" },
    { value: "Closed", label: "Clôturée" }
];

const DROPDOWN_STYLE = "w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-md z-50 overflow-hidden";

export default function StudyModal({ isOpen, onClose, studyToEdit = null, centers = [], users = [] }: any) {
    const [centerSearch, setCenterSearch] = useState("");
    const [sponsorSearch, setSponsorSearch] = useState("");
    const [isSponsorOpen, setIsSponsorOpen] = useState(false);
    const [isCentersOpen, setIsCentersOpen] = useState(false);

    const [startDateMonth, setStartDateMonth] = useState<Date>(new Date());
    const [protocolDateMonth, setProtocolDateMonth] = useState<Date>(new Date());

    const { data, setData, post, put, processing, reset } = useForm({
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
            r.name === 'study_admin' ||
            r.name?.toLowerCase().includes('sponsor') ||
            r.name === 'super_admin'
        );
        const matchesSearch = (u.name || "").toLowerCase().includes(sponsorSearch.toLowerCase());
        return hasSponsorRole && matchesSearch;
    });

    const filteredCenters = (centers || []).filter((c: any) => 
        c.name.toLowerCase().includes(centerSearch.toLowerCase())
    );

    const selectedSponsor = users.find((u: any) => u.id.toString() === data.sponsor_id.toString());

    useEffect(() => {
        if (studyToEdit) {
            const pDate = studyToEdit.protocol_date ? new Date(studyToEdit.protocol_date) : new Date();
            const sDate = studyToEdit.start_date ? new Date(studyToEdit.start_date) : undefined;
            setData({
                ...studyToEdit, 
                protocol_date: pDate, 
                start_date: sDate, 
                selected_centers: studyToEdit.centers?.map((c: any) => c.id) || [], 
                sponsor_id: studyToEdit.sponsor_id?.toString() || '',
                target_inclusions: studyToEdit.target_inclusions || 0,
                status: studyToEdit.status || 'Draft'
            });
            setProtocolDateMonth(pDate);
            if(sDate) setStartDateMonth(sDate);
        } else if (isOpen) {
            reset();
            setStartDateMonth(new Date());
            setProtocolDateMonth(new Date());
        }
    }, [studyToEdit, isOpen]);

    const handleTodayClick = (field: 'start_date' | 'protocol_date') => {
        const today = new Date();
        setData(field, today);
        field === 'start_date' ? setStartDateMonth(today) : setProtocolDateMonth(today);
    };

    const toggleCenter = (centerId: number) => {
        const current = [...data.selected_centers];
        const index = current.indexOf(centerId);
        index > -1 ? current.splice(index, 1) : current.push(centerId);
        setData('selected_centers', current);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studyToEdit) {
            put(route('studies.update', { study: studyToEdit.id }), {
                onSuccess: () => { reset(); onClose(); }
            });
        } else {
            post(route('studies.store'), {
                onSuccess: () => { reset(); onClose(); }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950 rounded-xl transition-colors">
                <form onSubmit={submit}>
                    
                    {/* Header */}
                    <div className={cn(
                        "relative p-8 text-white overflow-hidden",
                        studyToEdit ? "bg-orange-600" : "bg-primary"
                    )}>
                        <div className="relative z-10">
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                                        {studyToEdit ? <AlertCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold tracking-tight uppercase">
                                            {studyToEdit ? 'Édition du Protocole' : 'Nouveau Projet Clinique'}
                                        </DialogTitle>
                                        <DialogDescription className="text-white/70 font-medium">
                                            Configurez les paramètres globaux et les objectifs de votre étude.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 space-y-6 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto">
                        
                        {/* Section 1: Identification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <FileText className="w-4 h-4 text-slate-400" /> Nom de l'étude
                                </Label>
                                <Input className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 w-full" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="ex: Étude de phase III..." required />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Code Protocole
                                </Label>
                                <Input className="h-10 font-bold uppercase border-slate-200 dark:border-slate-800 dark:bg-slate-900 w-full" value={data.protocol_code} onChange={e => setData('protocol_code', e.target.value)} placeholder="ex: CT-2024-001" disabled={!!studyToEdit} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <CalendarIcon className="w-4 h-4 text-slate-400" /> Date de début prévue
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-start border-slate-200 dark:border-slate-800 dark:bg-slate-900 font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                            {data.start_date ? format(data.start_date, "PPP", { locale: fr }) : <span className="text-slate-400">ex: 15/01/2025</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-[100]" align="center">
                                        <Calendar mode="single" selected={data.start_date} onSelect={(d) => setData('start_date', d)} month={startDateMonth} onMonthChange={setStartDateMonth} locale={fr} />
                                        <div className="p-2 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <Button type="button" variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase text-primary" onClick={() => handleTodayClick('start_date')}>Aujourd'hui</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Section 2: Objectifs et Statut */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-slate-100 dark:border-slate-800 py-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Activity className="w-4 h-4 text-slate-400" /> Statut de l'étude
                                </Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-sm w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 dark:border-slate-800 z-[100]">
                                        {STUDY_STATUSES.map(s => (
                                            <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Target className="w-4 h-4 text-slate-400" /> Objectif d'inclusions
                                </Label>
                                <Input type="number" className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 w-full" value={data.target_inclusions} onChange={e => setData('target_inclusions', parseInt(e.target.value) || 0)} placeholder="ex: 150" />
                            </div>
                        </div>

                        {/* Section 3: Promoteur & Centres */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                                    <UserCircle className="w-4 h-4" /> Promoteur (Sponsor)
                                </Label>
                                <Popover open={isSponsorOpen} onOpenChange={setIsSponsorOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {selectedSponsor ? (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px]">
                                                            {selectedSponsor.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-sm truncate dark:text-slate-200">{selectedSponsor.name}</span>
                                                    </>
                                                ) : <span className="text-slate-400 text-sm">Sélectionner...</span>}
                                            </div>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start">
                                        <div className="p-2 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-center px-2 h-8 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <Search className="w-3 h-3 mr-2 text-slate-400" />
                                                <input className="text-xs w-full outline-none bg-transparent dark:text-slate-200" placeholder="Rechercher..." value={sponsorSearch} onChange={(e) => setSponsorSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="max-h-[180px] overflow-y-auto p-1">
                                            {filteredSponsors.map((user: any) => (
                                                <div key={user.id} onClick={() => { setData('sponsor_id', user.id.toString()); setIsSponsorOpen(false); }} 
                                                     className={cn("flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer", data.sponsor_id.toString() === user.id.toString() && "bg-slate-50 dark:bg-slate-800")}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] dark:text-slate-300">{user.name.charAt(0)}</div>
                                                        <span className="text-sm dark:text-slate-200">{user.name}</span>
                                                    </div>
                                                    {data.sponsor_id.toString() === user.id.toString() && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                                    <Building2 className="w-4 h-4" /> Centres ({data.selected_centers.length})
                                </Label>
                                <Popover open={isCentersOpen} onOpenChange={setIsCentersOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <span className={cn("truncate text-sm", data.selected_centers.length === 0 && "text-slate-400")}>
                                                {data.selected_centers.length > 0 ? `${data.selected_centers.length} centres sélectionnés` : "Sélectionner..."}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={DROPDOWN_STYLE} align="start">
                                        <div className="p-2 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <div className="flex items-center px-2 h-8 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <Search className="w-3 h-3 mr-2 text-slate-400" />
                                                <input className="text-xs w-full outline-none bg-transparent dark:text-slate-200" placeholder="Rechercher un centre..." value={centerSearch} onChange={(e) => setCenterSearch(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="max-h-[180px] overflow-y-auto p-1">
                                            {filteredCenters.map((center: any) => (
                                                <div key={center.id} onClick={() => toggleCenter(center.id)} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                                                    <Checkbox checked={data.selected_centers.includes(center.id)} onCheckedChange={() => toggleCenter(center.id)} />
                                                    <span className="text-sm dark:text-slate-200">{center.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Section 4: Details Techniques */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Beaker className="w-4 h-4 text-slate-400" /> Phase</Label>
                                <Select value={data.phase} onValueChange={(v) => setData('phase', v)}>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-sm w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 dark:border-slate-800 z-[100]">{["Phase I", "Phase II", "Phase III", "Phase IV", "Observational"].map(p => <SelectItem key={p} value={p} className="cursor-pointer">{p}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Stethoscope className="w-4 h-4 text-slate-400" /> Aire Thérapeutique</Label>
                                <Select value={data.therapeutic_area} onValueChange={(v) => setData('therapeutic_area', v)}>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-sm w-full"><SelectValue placeholder="ex: Oncologie" /></SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 dark:border-slate-800 max-h-52 z-[100]">{THERAPEUTIC_AREAS.map(area => <SelectItem key={area} value={area} className="cursor-pointer">{area}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Section 5: Versioning */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Info className="w-4 h-4 text-slate-400" /> Version du protocole</Label>
                                <Input className="h-10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 w-full" value={data.protocol_version} onChange={e => setData('protocol_version', e.target.value)} placeholder="ex: 1.0" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Layout className="w-4 h-4 text-slate-400" /> Date de version</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-10 justify-start border-slate-200 dark:border-slate-800 dark:bg-slate-900 font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                            {data.protocol_date ? format(data.protocol_date, "PPP", { locale: fr }) : <span className="text-slate-400">Choisir...</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-[100]" align="center">
                                        <Calendar mode="single" selected={data.protocol_date} onSelect={(d) => setData('protocol_date', d)} month={protocolDateMonth} onMonthChange={setProtocolDateMonth} locale={fr} />
                                        <div className="p-2 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                            <Button type="button" variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase text-primary" onClick={() => handleTodayClick('protocol_date')}>Aujourd'hui</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} 
                                className="h-11 px-8 font-bold uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} 
                                className={cn(
                                    "h-11 px-8 font-black uppercase text-xs tracking-widest text-white shadow-md", 
                                    studyToEdit ? "bg-orange-600 hover:bg-orange-700" : "bg-primary hover:bg-primary/90"
                                )}>
                            {processing ? <Loader2 className="animate-spin mr-2" /> : (studyToEdit ? "Mettre à jour" : "Lancer l'étude")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}