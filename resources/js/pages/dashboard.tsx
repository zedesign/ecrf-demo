import { router, Head } from '@inertiajs/react';
import { useState, useMemo } from 'react'; // Ajout de useMemo
import { 
    Filter, LayoutGrid, Plus, Search, 
    CheckCircle2, Clock, FileEdit, Archive, XCircle
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import CreateStudyModal from '@/pages/studies/crfbuilder/CreateStudyModal';
import EditStudyModal from '@/pages/studies/crfbuilder/EditStudyModal';
import AuditTrailModal from '@/pages/studies/crfbuilder/AuditTrailModal';
import StudyCard from '@/pages/studies/crfbuilder/StudyCard'; 

interface DashboardProps {
    auth: any;
    studies: any[];
    centers: any[];
    users: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard({ auth, studies, centers, users }: DashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudy, setSelectedStudy] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- NOUVEL ÉTAT POUR LE FILTRE DE STATUT ---
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedStudyForAudit, setSelectedStudyForAudit] = useState<any>(null);

    // Calcul des compteurs en temps réel
    const stats = useMemo(() => ({
        draft: studies.filter(s => s.status?.toLowerCase() === 'draft').length,
        active: studies.filter(s => s.status?.toLowerCase() === 'active').length,
        closed: studies.filter(s => s.status?.toLowerCase() === 'closed').length,
        archived: studies.filter(s => s.status?.toLowerCase() === 'archived').length,
    }), [studies]);

    const handleCreate = () => {
        setSelectedStudy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (study: any) => {
        setSelectedStudy(study);
        setIsModalOpen(true);
    };

    const handleOpenAudit = (studyId: number) => {
        const freshStudy = studies.find((s: any) => s.id === studyId);
        setSelectedStudyForAudit(freshStudy);
        setIsAuditModalOpen(true);
    };

    // --- LOGIQUE DE FILTRAGE COMBINÉE (Recherche + Statut) ---
    const filteredStudies = studies.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.protocol_code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = selectedStatus ? s.status?.toLowerCase() === selectedStatus.toLowerCase() : true;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sélection d'étude" />
            
            <div className="p-6 lg:p-10 w-full max-w-[1600px] mx-auto space-y-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <LayoutGrid className="text-primary" size={28} />
                            </div>
                            Mes études
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Gérez et suivez vos protocoles cliniques en temps réel.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input 
                                    type="text" 
                                    placeholder="Rechercher une étude..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-[200px] lg:w-[300px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-primary"
                                />
                            </div>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className={`p-2 rounded-xl transition-all shadow-sm border ${
                                        selectedStatus 
                                        ? 'bg-primary text-primary-foreground border-primary' 
                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                                    }`}>
                                        <Filter size={20} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-5 rounded-2xl" align="end">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Filtres</h4>
                                            {selectedStatus && (
                                                <button 
                                                    onClick={() => setSelectedStatus(null)}
                                                    className="text-[10px] font-bold text-primary hover:underline uppercase"
                                                >
                                                    Réinitialiser
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Statut</p>
                                            <div className="grid gap-1">
                                                <FilterOption 
                                                    icon={Clock} 
                                                    label="Brouillons" 
                                                    count={stats.draft} 
                                                    isActive={selectedStatus === 'draft'}
                                                    onClick={() => setSelectedStatus('draft')}
                                                />
                                                <FilterOption 
                                                    icon={CheckCircle2} 
                                                    label="Actives" 
                                                    count={stats.active} 
                                                    color="text-emerald-500" 
                                                    isActive={selectedStatus === 'active'}
                                                    onClick={() => setSelectedStatus('active')}
                                                />
                                                <FilterOption 
                                                    icon={XCircle} 
                                                    label="Clôturées" 
                                                    count={stats.closed} 
                                                    color="text-slate-500"
                                                    isActive={selectedStatus === 'closed'}
                                                    onClick={() => setSelectedStatus('closed')}
                                                />
                                                <FilterOption 
                                                    icon={Archive} 
                                                    label="Archivées" 
                                                    count={stats.archived} 
                                                    color="text-rose-500"
                                                    isActive={selectedStatus === 'archived'}
                                                    onClick={() => setSelectedStatus('archived')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <button 
                            onClick={handleCreate}
                            className="group flex items-center h-[52px] overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:opacity-95 transition-all"
                        >
                            <div className="bg-black/10 h-full flex items-center px-4 border-r border-white/10 group-hover:bg-black/20 transition-colors">
                                <Plus size={20} className="stroke-[3px]" />
                            </div>
                            <span className="px-6 text-sm font-bold tracking-wide uppercase"> Nouvelle étude </span>
                        </button>
                    </div>
                </div>

                {/* --- GRILLE DES ÉTUDES --- */}
                {filteredStudies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredStudies.map((study: any) => (
                            <StudyCard 
                                key={study.id} 
                                study={study} 
                                onEdit={() => handleEdit(study)} 
                                onOpenAudit={() => handleOpenAudit(study.id)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Search size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">Aucune étude ne correspond à vos critères.</p>
                        <button onClick={() => {setSearchQuery(''); setSelectedStatus(null);}} className="text-primary font-bold text-sm mt-2 hover:underline">Effacer les filtres</button>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            {selectedStudy ? (
                <EditStudyModal 
                    isOpen={isModalOpen} 
                    onClose={() => { setIsModalOpen(false); setSelectedStudy(null); }} 
                    study={selectedStudy} 
                    centers={centers}
                    users={users}
                />
            ) : (
                <CreateStudyModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    centers={centers}
                    users={users}
                />
            )}

            <AuditTrailModal 
                isOpen={isAuditModalOpen}
                onClose={() => { setIsAuditModalOpen(false); setSelectedStudyForAudit(null); }}
                study={selectedStudyForAudit}
            />
        </AppLayout>
    );
}

// Composant FilterOption mis à jour pour gérer l'état actif
function FilterOption({ icon: Icon, label, count, color, isActive, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-between p-3 rounded-xl transition-all group w-full text-left ${
                isActive 
                ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-primary" : (color || "text-slate-400")} />
                <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-slate-700 dark:text-slate-300"}`}>
                    {label}
                </span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                isActive 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-950'
            }`}>
                {count}
            </span>
        </button>
    );
}