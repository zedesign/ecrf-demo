import React from 'react';
import { 
    User, MessageSquare, 
    History, Clock,
    ArrowDown
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const FIELD_LABELS: { [key: string]: string } = {
    name: "Nom de l'étude",
    protocol_version: "Version",
    protocol_date: "Date protocole",
    status: "Statut",
    phase: "Phase",
    target_inclusions: "Objectif inclusions",
    therapeutic_area: "Aire thérapeutique",
    centers: "Centres associés",
    sponsor_id: "Promoteur"
};

export default function AuditTrailModal({ isOpen, onClose, study }: any) {
    if (!study) return null;

    const formatDateFull = (dateString: string) => {
        const d = new Date(dateString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        
        const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
        const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        return `${date} ${time}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Garde tes couleurs de fond slate d'origine */}
            <DialogContent className="!max-w-[35vw] max-h-[90vh] overflow-hidden p-0 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl bg-white dark:bg-slate-950">
                
                {/* --- HEADER --- */}
                <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Couleur d'icône et bordure passées en Primary (ton vert) */}
                            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                                <History size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white leading-none">
                                    Audit Trail System
                                </DialogTitle>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protocol ID:</span>
                                        {/* Badge fond primary */}
                                        <Badge className="bg-primary text-primary-foreground text-[9px] font-black tracking-widest px-2 py-0 rounded-none border-none">
                                            {study.protocol_code}
                                        </Badge>
                                    </div>
                                    <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logs:</span>
                                        {/* Badge contour primary */}
                                        <Badge variant="outline" className="border-primary text-primary text-[9px] font-black tracking-widest px-2 py-0 rounded-none">
                                            {study.audit_logs?.length || 0} ENTRÉES
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* --- CONTENU --- */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)] bg-[#f8fafc] dark:bg-slate-950 p-6 space-y-4">
                    {study.audit_logs && study.audit_logs.length > 0 ? (
                        study.audit_logs.map((log: any) => (
                            <div key={log.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                                
                                {/* Info Bar */}
                                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                <User size={12} className="text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                {log.user?.name || 'Système'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold font-mono tracking-tight text-slate-500">
                                                {formatDateFull(log.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Champ :</span>
                                        {/* Label badge en primary */}
                                        <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary bg-primary/5 rounded uppercase tracking-widest">
                                            {FIELD_LABELS[log.field_name] || log.field_name}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-4">
                                    {/* Donnée Initiale */}
                                    <div className="flex-1 w-full space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Donnée Initiale</span>
                                        </div>
                                        <div className="text-[12px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[40px] flex items-center break-all">
                                            {log.old_value || "Aucune valeur"}
                                        </div>
                                    </div>

                                    <div className="flex items-center px-4">
                                        <ArrowDown size={14} className="text-slate-200" />
                                    </div>

                                    {/* Donnée Modifiée - Utilisation du Primary pour l'accentuation */}
                                    <div className="flex-1 w-full space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Donnée Modifiée</span>
                                        </div>
                                        <div className="text-[12px] text-slate-900 dark:text-white font-bold bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20 min-h-[40px] flex items-center break-all shadow-inner">
                                            {log.new_value}
                                        </div>
                                    </div>
                                </div>

                                {/* Justification */}
                                {log.reason && (
                                    <div className="px-5 py-3 bg-[#f8fafc] dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3">
                                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                                            {/* Icône Message en Primary */}
                                            <MessageSquare size={12} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Raison du changement</p>
                                            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold italic leading-relaxed">
                                                "{log.reason}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <History size={40} className="text-slate-200 dark:text-slate-800 mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aucun enregistrement d'audit</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}