import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Trash2, User, Clock } from 'lucide-react';
import InitialPasswordForm from '@/pages/auth/InitialPasswordForm';

interface SavedAccount {
    email: string;
    role: string;
    expires_at: string;
}

interface CustomPageProps {
    auth: { user: { id: number; name: string; email: string; role: string } };
    [key: string]: any;
}

export default function Login({ canResetPassword }: { canResetPassword: boolean }) {
    // --- États ---
    const [mustCreate, setMustCreate] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [recentAccounts, setRecentAccounts] = useState<SavedAccount[]>([]);
    const [showRecent, setShowRecent] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const isAutoSelecting = useRef(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        remember: false,
    });

    // --- Initialisation ---
    useEffect(() => {
        // Charger les comptes locaux
        const saved = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
        const valid = saved.filter((acc: SavedAccount) => new Date(acc.expires_at) > new Date());
        setRecentAccounts(valid);

        // Fermer le dropdown au clic extérieur
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowRecent(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Logique métier ---
    const checkEmailStatus = async (email: string) => {
        if (!email || !email.includes('@')) return;
        setCheckingEmail(true);
        try {
            const response = await axios.post('/check-user-password-status', { email });
            setMustCreate(!!response.data.must_create_password);
        } catch (error) {
            setMustCreate(false);
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleSelectAccount = (email: string) => {
        isAutoSelecting.current = true;
        setData('email', email);
        setShowRecent(false);
        checkEmailStatus(email);
        
        // Focus automatique sur le mot de passe
        setTimeout(() => {
            const passInput = document.getElementById('password') as HTMLInputElement;
            if (passInput) passInput.focus();
            isAutoSelecting.current = false;
        }, 150);
    };

    const forgetAccount = (e: React.MouseEvent, email: string) => {
        e.stopPropagation();
        const filtered = recentAccounts.filter(acc => acc.email !== email);
        setRecentAccounts(filtered);
        localStorage.setItem('saved_accounts', JSON.stringify(filtered));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route(mustCreate ? 'password.initial-setup' : 'login'), {
            onSuccess: (page) => {
                const props = page.props as unknown as CustomPageProps;
                const user = props.auth?.user;
                if (data.remember && user) {
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 14); // Garder 14 jours
                    const saved = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
                    const updated = [
                        { email: user.email, role: user.role, expires_at: expiresAt.toISOString() }, 
                        ...saved.filter((a: SavedAccount) => a.email !== user.email)
                    ];
                    localStorage.setItem('saved_accounts', JSON.stringify(updated.slice(0, 5)));
                }
            }
        });
    };

    return (
        <AuthLayout
            title={mustCreate ? "Définir votre mot de passe" : "Connexion"}
            description={mustCreate ? "C'est votre première connexion au compte." : "Entrez vos identifiants pour accéder à votre espace."}
        >
            <Head title="Connexion" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    
                    {/* CHAMP EMAIL + DROPDOWN SÉCURISÉ */}
                    <div className="grid gap-2 relative" ref={dropdownRef}>
                        <Label htmlFor="email">Adresse Email</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                // Utiliser "one-time-code" est le seul moyen fiable de bloquer l'historique Chrome
                                autoComplete="one-time-code"
                                className='h-12 pr-10'
                                required
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    if (showRecent) setShowRecent(false);
                                }}
                                onFocus={() => {
                                    if (recentAccounts.length > 0 && !data.email) setShowRecent(true);
                                }}
                                onBlur={(e) => {
                                    setTimeout(() => {
                                        if (!isAutoSelecting.current) checkEmailStatus(e.target.value);
                                    }, 200);
                                }}
                                placeholder="votre@email.com"
                            />
                            {checkingEmail && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Spinner className="h-4 w-4" />
                                </div>
                            )}
                        </div>

                        {/* LISTE DES COMPTES RÉCENTS */}
                        {showRecent && recentAccounts.length > 0 && (
                            <div className="absolute top-[78px] w-full z-50 bg-dark-cyan-950 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2.5 border-b border-slate-700/50 bg-dark-cyan-900">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                                        <Clock size={12} /> Comptes récents
                                    </span>
                                </div>
                                <div className="flex flex-col max-h-[240px] overflow-y-auto">
                                    {recentAccounts.map((acc) => (
                                        <div 
                                            key={acc.email} 
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Évite la perte de focus de l'input
                                                handleSelectAccount(acc.email);
                                            }}
                                            className="group flex items-center justify-between p-3.5 hover:bg-dark-cyan-900/60 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-dark-cyan-700 flex items-center justify-center text-slate-300">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium text-slate-100">{acc.email}</span>
                                                    {acc.role && (
                                                        <span className={`w-fit mt-0.5 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase ${acc.role === 'admin' ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-dark-cyan-600 border-dark-cyan-600/50 bg-sky-500/10'}`}>
                                                            {acc.role}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onMouseDown={(e) => e.stopPropagation()} 
                                                onClick={(e) => forgetAccount(e, acc.email)}
                                                className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <InputError message={errors.email} />
                    </div>

                    {/* SECTION MOT DE PASSE OU FORMULAIRE INITIAL */}
                    {!mustCreate ? (
                        <div className="grid gap-2 animate-in fade-in duration-500">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mot de passe</Label>
                                {canResetPassword && (
                                    <TextLink href={request()} className="ml-auto text-sm">Oublié ?</TextLink>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showLoginPassword ? "text" : "password"}
                                    className='h-12 pr-10'
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowLoginPassword(!showLoginPassword)} 
                                    className="absolute right-2 top-2 p-2 text-muted-foreground"
                                >
                                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-1">
                                <Checkbox 
                                    id="remember" 
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                />
                                <Label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer">Se souvenir de moi</Label>
                            </div>
                            <InputError message={errors.password} />
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-top-2 duration-500">
                            <InitialPasswordForm 
                                data={data} 
                                setData={setData} 
                                errors={errors} 
                                processing={processing} 
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="mt-4 w-full h-11 bg-dark-cyan-800 hover:bg-dark-cyan-900"
                        disabled={processing || checkingEmail}
                    >
                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                        {mustCreate ? "Enregistrer et se connecter" : "Se connecter"}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}