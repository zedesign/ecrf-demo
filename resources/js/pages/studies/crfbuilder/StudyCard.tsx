import { router } from '@inertiajs/react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Calendar, FileEdit, History, 
    Layers, Beaker, ChevronRight,
    MapPin, Stethoscope, Clock
} from 'lucide-react';

interface StudyCardProps {
    study: any;
    onEdit: () => void;
    onOpenAudit: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    active: { color: 'bg-emerald-500', variant: 'default' },
    draft: { color: 'bg-slate-400', variant: 'secondary' },
    closed: { color: 'bg-rose-600', variant: 'outline' },
    archived: { color: 'bg-dark-cyan-900', variant: 'destructive' },
    paused: {color: 'bg-amber-500', variant: 'secondary'}
};

export default function StudyCard({ study, onEdit, onOpenAudit }: StudyCardProps) {
    const statusKey = study.status?.toLowerCase() || 'draft';
    const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;

    const progress = study.target_inclusions > 0 
        ? Math.min(100, Math.round((study.current_inclusions || 0) / study.target_inclusions * 100)) 
        : 0;

    const goToDetails = () => {
        router.visit(`/studies/${study.protocol_code}`);
    };

    return (
        <div 
            onClick={goToDetails}
            className="group relative flex flex-col h-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
            {/* --- BARRE SUPÉRIEURE DYNAMIQUE --- */}
            <div className={`h-1.5 w-full transition-colors duration-500 ${config.color}`} />

            <div className="p-5 flex flex-col flex-grow">
                {/* HEADER: Code Protocole en Titre & Actions */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Beaker size={18} />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            {study.protocol_code}
                        </h2>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onOpenAudit(); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors">
                            <History size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors">
                            <FileEdit size={16} />
                        </button>
                    </div>
                </div>

                {/* DESCRIPTION: Nom de l'étude & Aire Thérapeutique */}
                <div className="mb-4 flex-grow">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mb-3">
                        {study.name}
                    </p>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1 text-primary/70">
                            <Stethoscope size={12} /> {study.therapeutic_area || 'Non spécifiée'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin size={12} /> {study.centers?.length || 0} Centres
                        </span>
                    </div>
                </div>

                {/* INFOS COMPLÉMENTAIRES: Version & Date de début */}
                <div className="flex items-center gap-4 mb-5 text-[10px] font-bold text-slate-400 uppercase border-t border-slate-50 pt-3">
                    <span className="flex items-center gap-1">
                        <Layers size={12} /> v{study.protocol_version}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> Début: {study.start_date ? new Date(study.start_date).toLocaleDateString('fr-FR') : 'À définir'}
                    </span>
                </div>

                {/* PROGRESS SECTION */}
                <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Inclusions</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{study.current_inclusions || 0}</span>
                                <span className="text-xs text-slate-500">/ {study.target_inclusions}</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>

                {/* FOOTER: Status & Phase */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Badge variant={config.variant} className="font-bold text-[10px] uppercase px-2 py-0">
                        {study.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold uppercase tracking-tight">
                        <span>{study.phase}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-primary/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}