import { usePage, router } from '@inertiajs/react';
import { Beaker, ChevronsUpDown, Check } from 'lucide-react';
import {
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuSeparator, 
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarStudySelect() {
    const { activeStudy, allStudies } = usePage().props as any;
    const studiesList = Array.isArray(allStudies) ? allStudies : [];
    
    const study = activeStudy || { 
        id: null, 
        protocol_code: "Sélectionner", 
        protocol_version: "-", 
        phase: "-", 
        status: 'Draft' 
    };

    const handleStudyChange = (protocolCode: string) => {
        if (!protocolCode) return;
        
        router.get(route('studies.show', { study: protocolCode }));
    };

    return (
        <div className="px-4 mb-6 shrink-0 mt-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center p-3 rounded-2xl bg-accent/40 border border-border hover:border-primary/50 transition-all outline-none text-left group text-foreground">
                        <div className="relative shrink-0">
                            <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm">
                                <Beaker size={20} />
                            </div>
                            <div className="absolute bottom-7 -left-0.5">
                                <StatusCircle status={study.status} />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 ml-3">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5 opacity-80">Étude active</p>
                            <p className="text-sm font-bold truncate leading-tight">
                                {study.protocol_code}
                            </p>
                        </div>
                        <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-primary transition-colors ml-1" />
                    </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                    align="start" 
                    className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl shadow-xl border border-border p-2 bg-card z-[110]"
                >
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Mes études ({studiesList.length})
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {studiesList.length > 0 ? (
                            studiesList.map((s: any) => (
                                    <DropdownMenuItem 
                                        key={s.id}
                                        // PASSAGE DU protocol_code AU LIEU DE s.id
                                        onClick={() => handleStudyChange(s.protocol_code)} 
                                        className={`rounded-xl py-3 px-3 cursor-pointer ...`}
                                    >
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${Number(s.id) === Number(study.id) ? 'bg-primary' : 'bg-slate-300'}`} />
                                            <span className={`truncate text-sm ${Number(s.id) === Number(study.id) ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                {s.protocol_code}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground truncate pl-3.5 opacity-80 font-medium">
                                            {s.protocol_version || '-'} | {s.phase || '-'}
                                        </span>
                                    </div>
                                    {Number(s.id) === Number(study.id) && <Check size={14} className="text-primary shrink-0 ml-2" />}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-xs text-center text-muted-foreground italic">
                                Aucune étude disponible
                            </div>
                        )}
                    </div>
                    
                    <DropdownMenuSeparator className="my-2 bg-border opacity-50" />
                    
                    <DropdownMenuItem 
                        onClick={() => router.visit('/dashboard')} 
                        className="rounded-xl py-2 px-3 cursor-pointer focus:bg-accent text-primary font-bold text-xs"
                    >
                        Voir toutes les études
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function StatusCircle({ status }: { status: string }) {
    const config: Record<string, { color: string, pulse: boolean }> = {
        'Draft': { color: 'bg-slate-400', pulse: false },
        'Active': { color: 'bg-emerald-600', pulse: true },
        'Closed': { color: 'bg-red-600', pulse: false },
        'Completed': { color: 'bg-blue-600', pulse: false },
        'Archived': { color: 'bg-slate-700', pulse: false },
    };
    
    const { color, pulse } = config[status] || config['Draft'];
    
    return (
        <div className="relative flex h-3 w-3">
            {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-40`}></span>}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${color} border-2 border-card shadow-sm`}></span>
        </div>
    );
}