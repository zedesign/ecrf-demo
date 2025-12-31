import { Head, Link } from '@inertiajs/react';
import { 
    Calendar, Users, MapPin, ArrowLeft, 
    Mail, Building2, BadgeCheck,
    AlertCircle, FileCheck, UserMinus, MessageSquare,
    ChevronRight, Clock, MoreVertical, Search
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Simulation de composants type Shadcn
import { Separator } from "@/components/ui/separator"; 

interface ShowProps {
    study: any;
}

interface FormItem {
    id: string;
    title: string;
    status: string;
    order_index: number;
}

export default function Show({ study }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: study.protocol_code, href: '#' },
    ];

    const progressPercent = study.target_inclusions > 0 
        ? Math.round((study.current_inclusions || 12) / (study.target_inclusions || 150) * 100) 
        : 8;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={study.protocol_code} />

            <div className="p-8 w-full max-w-[1600px] mx-auto">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* --- COLONNE DE GAUCHE : LE BLOC FUSIONNÉ --- */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* HEADER DE L'ÉTUDE */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft size={20} />
                                </Link>
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 leading-none">
                                    {study.protocol_code}
                                </h1>
                                <div className="flex gap-1.5 ml-2">
                                    <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-[10px] font-medium rounded-md text-zinc-600 uppercase">
                                        v{study.protocol_version}
                                    </span>
                                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-[10px] font-bold rounded-md text-emerald-600 uppercase">
                                        {study.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium pl-8">
                                {study.name}
                            </p>
                        </div>

                        {/* LE "GRAND BLOC FUSIONNÉ" (Inspiré de Coolors/Modern SaaS) */}
                        <div className="group border border-zinc-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
                            
                            {/* Partie Haute : Progression (Header du bloc) */}
                            <div className="bg-zinc-950 p-8 text-white flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * progressPercent) / 100} className="text-white" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-sm font-bold">{progressPercent}%</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight">Progression de l'étude</h2>
                                        <p className="text-zinc-400 text-sm font-medium">
                                            <span className="text-white">{study.current_inclusions || 12}</span> sur {study.target_inclusions || 150} patients inclus
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5">
                                        Détails inclusions
                                    </button>
                                </div>
                            </div>

                            {/* Barre de séparation / Recherche (Style Shadcn) */}
                            <div className="px-8 py-4 bg-zinc-50 border-y border-zinc-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Search size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Formulaires & Visites</span>
                                </div>
                                <div className="text-[10px] font-bold text-zinc-400">
                                    8 DOCUMENTS AU TOTAL
                                </div>
                            </div>

                            {/* Partie Basse : Grille de Formulaires DYNAMIQUE */}
                            <div className="max-h-[450px] overflow-y-auto p-6 bg-white scrollbar-hide">
                                {study.forms && study.forms.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {study.forms.map((form: FormItem) => (
                                            <CoolorsFormItem 
                                                key={form.id}
                                                id={form.id}
                                                title={form.title} 
                                                status={form.status === 'published' ? 'Complété' : 'En cours'} 
                                                color={form.status === 'published' ? 'bg-blue-500' : 'bg-emerald-500'} 
                                                progress={form.status === 'published' ? 100 : 45} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    /* Affichage si aucun formulaire n'existe */
                                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-zinc-100 rounded-3xl">
                                        <AlertCircle className="text-zinc-200 mb-2" size={32} />
                                        <p className="text-sm text-zinc-400 font-medium text-center">
                                            Aucun eCRF n'a été créé pour le moment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TABLEAU DES INCLUSIONS (Style Minimaliste) */}
                        <div className="border border-zinc-200 rounded-3xl bg-white overflow-hidden shadow-sm">
                            <div className="p-6 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Inclusions récentes</h3>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-t border-zinc-100">
                                    <thead>
                                        <tr className="bg-zinc-50/50 text-[10px] font-bold uppercase text-zinc-400">
                                            <th className="px-6 py-3 text-left">ID Patient</th>
                                            <th className="px-6 py-3 text-left">Date</th>
                                            <th className="px-6 py-3 text-left">Progression</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        <PatientRowSimple id="C1-002" date="24/12/2025" progress={65} />
                                        <PatientRowSimple id="C1-001" date="22/12/2025" progress={100} />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* --- COLONNE DE DROITE : BLOCS ISOLÉS --- */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* GRILLE DE STATS TYPE "DASHBOARD" */}
                        <div className="grid grid-cols-2 gap-3">
                            <SmallStatCard label="Requêtes" value="04" color="text-amber-600" />
                            <SmallStatCard label="Alertes" value="00" color="text-zinc-300" />
                            <SmallStatCard label="Signatures" value="12" color="text-emerald-600" />
                            <SmallStatCard label="Exclusions" value="01" color="text-rose-600" />
                        </div>

                        {/* BLOCS D'INFO (Style Shadcn Card) */}
                        <div className="space-y-3">
                            <ShadcnInfoCard label="Promoteur" title={study.sponsor?.name} sub={study.sponsor?.email} icon={<BadgeCheck size={16}/>} />
                            <ShadcnInfoCard label="Centres" title={`${study.centers?.length || 0} Centres`} sub="Sites investigateurs" icon={<Building2 size={16}/>} />
                            <ShadcnInfoCard label="Calendrier" title="Protocole validé" sub={new Date(study.protocol_date).toLocaleDateString()} icon={<Calendar size={16}/>} />
                        </div>

                        {/* NOTE DE BAS DE PAGE */}
                        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Dernière activité</p>
                            <p className="text-xs text-zinc-600 leading-relaxed font-medium italic">
                                Mise à jour du dossier patient C1-002 par Dr. Ory il y a 2 heures.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// --- SOUS-COMPOSANTS DESIGN ---

function CoolorsFormItem({ id, title, status, color, progress }: any) {
    return (
        <Link 
            href={`/builder/forms/${id}/edit`} // L'URL de ton futur builder
            className="flex flex-col p-4 bg-zinc-50/50 hover:bg-white border border-zinc-100 hover:border-zinc-300 rounded-2xl transition-all text-left group"
        >
            <div className="flex justify-between items-start mb-4 w-full">
                <div className={`h-2 w-10 rounded-full ${color}`} />
                <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-900 transition-transform group-hover:translate-x-1" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 leading-none">{title}</h4>
            <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">{status}</span>
                <span className="text-[10px] font-bold text-zinc-900">{progress}%</span>
            </div>
        </Link>
    );
}

function SmallStatCard({ label, value, color }: any) {
    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</span>
            <span className={`text-2xl font-black tracking-tighter ${color}`}>{value}</span>
        </div>
    );
}

function ShadcnInfoCard({ label, title, sub, icon }: any) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-bold text-zinc-400 uppercase leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-zinc-900 truncate">{title || 'Non défini'}</p>
                <p className="text-[10px] text-zinc-500 truncate">{sub}</p>
            </div>
        </div>
    );
}

function PatientRowSimple({ id, date, progress }: any) {
    return (
        <tr className="hover:bg-zinc-50/50 transition-colors group">
            <td className="px-6 py-4 text-sm font-bold text-zinc-900">{id}</td>
            <td className="px-6 py-4 text-xs font-medium text-zinc-500">{date}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-20 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold">{progress}%</span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-900">
                    <MoreVertical size={16} />
                </button>
            </td>
        </tr>
    );
}