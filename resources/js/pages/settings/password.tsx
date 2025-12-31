import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { RefreshCw, Check, Eye, EyeOff, Copy, ClipboardCheck } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sécurité', href: '/settings/password' },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    
    // États pour la visibilité des mots de passe
    const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Nouvel état pour l'actuel
    const [showPassword, setShowPassword] = useState(false);
    
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-slate-200' });
    const [allowWeakPassword, setAllowWeakPassword] = useState(false);

    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const generateStrongPassword = () => {
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*+";
        const newPassword = Array.from(crypto.getRandomValues(new Uint32Array(16)))
            .map((x) => chars[x % chars.length])
            .join('');
        
        setData((prev) => ({ 
            ...prev, 
            password: newPassword, 
            password_confirmation: newPassword 
        }));
        setShowPassword(true);
    };

    const copyToClipboard = () => {
        if (!data.password) return;
        navigator.clipboard.writeText(data.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const pwd = data.password;
        if (!pwd) {
            setStrength({ score: 0, label: '', color: 'bg-slate-200' });
            return;
        }

        let score = 0;
        const len = pwd.length;

        if (len < 6) {
            score = 0;
        } else if (len >= 6 && len < 8) {
            score = 1;
        } else if (len >= 8) {
            score = 2;
        }

        if (len >= 8) {
            const hasUpper = /[A-Z]/.test(pwd);
            const hasNumber = /[0-9]/.test(pwd);
            const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
            if (hasUpper && hasNumber) score += 1;
            if (hasSpecial && len >= 10) score += 1;
        }

        const sequences = ["azerty", "qwerty", "123456", "asdfgh"];
        const isSequence = sequences.some(seq => pwd.toLowerCase().includes(seq));
        if (isSequence || /(.)\1\1/.test(pwd)) {
            score = Math.max(1, score - 2);
        }

        const levels = [
            { label: 'Faible (Trop simple)', color: 'bg-red-500' },
            { label: 'Moyen (Insuffisant)', color: 'bg-orange-500' },
            { label: 'Fort', color: 'bg-emerald-500' },
            { label: 'Très robuste', color: 'bg-blue-600' },
            { label: 'Excellent', color: 'bg-indigo-600' },
        ];

        const finalScore = Math.min(score, levels.length - 1);
        setStrength({ score: (finalScore / 4) * 100, ...levels[finalScore] });
        
        if (finalScore >= 2) setAllowWeakPassword(false);
    }, [data.password]);

    const isWeak = data.password.length > 0 && (data.password.length < 8 || strength.score < 50);
    const isDisabled = processing || (isWeak && !allowWeakPassword);

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowPassword(false);
                setShowCurrentPassword(false);
                setAllowWeakPassword(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres de sécurité" />

            <div className="max-w-xl space-y-6 p-6">
                <HeadingSmall
                    title="Mettre à jour le mot de passe"
                    description="Utilisez un mot de passe d'au moins 8 caractères."
                />

                <form onSubmit={updatePassword} className="space-y-6">
                    {/* CHAMP MOT DE PASSE ACTUEL AVEC OEIL */}
                    <div className="grid gap-2 text-foreground">
                        <Label htmlFor="current_password">Mot de passe actuel</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="current_password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className="rounded-xl border-dark-cyan-100 dark:border-border pr-10"
                                placeholder='Saisissez votre mot de passe actuel'
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                                className="absolute right-2 p-2 text-muted-foreground hover:text-dark-cyan-600"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <InputError message={errors.current_password} />
                    </div>

                    {/* NOUVEAU MOT DE PASSE */}
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Nouveau mot de passe</Label>
                            <button
                                type="button"
                                onClick={generateStrongPassword}
                                className="flex items-center gap-1.5 text-xs font-bold text-dark-cyan-600 hover:underline"
                            >
                                <RefreshCw size={14} /> Générer
                            </button>
                        </div>
                        
                        <div className="relative flex items-center">
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showPassword ? "text" : "password"}
                                className={`pr-24 rounded-xl border-dark-cyan-100 dark:border-border transition-all ${isWeak && !allowWeakPassword ? 'border-orange-500 ring-1 ring-orange-500/20' : ''}`}
                                placeholder='8 caractères minimum'
                            />
                            <div className="absolute right-2 flex items-center gap-1">
                                {data.password && (
                                    <button type="button" onClick={copyToClipboard} className="p-2 text-muted-foreground hover:text-dark-cyan-600">
                                        {copied ? <ClipboardCheck size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </button>
                                )}
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-muted-foreground hover:text-dark-cyan-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {data.password && (
                            <div className="mt-1 space-y-3 px-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                                    <span>Force</span>
                                    <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: `${Math.max(strength.score, 10)}%` }} />
                                </div>

                                {isWeak && (
                                    <div className="flex items-start space-x-2 rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-500/20 dark:bg-orange-500/5 animate-in fade-in zoom-in duration-200">
                                        <Checkbox 
                                            id="allow-weak" 
                                            checked={allowWeakPassword}
                                            onCheckedChange={(checked) => setAllowWeakPassword(checked === true)}
                                            className="mt-0.5 border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <div className="grid gap-1 leading-none">
                                            <label htmlFor="allow-weak" className="text-xs font-bold text-orange-700 dark:text-orange-400 cursor-pointer">
                                                Autoriser un mot de passe faible (min. 8 caractères conseillé)
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <InputError message={errors.password} />
                    </div>

                    {/* CONFIRMATION */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                        <Input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showPassword ? "text" : "password"}
                            className="rounded-xl border-dark-cyan-100 dark:border-border"
                            placeholder='Confirmer le nouveau mot de passe'
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button 
                            disabled={isDisabled}
                            className={`px-8 rounded-xl shadow-lg transition-all active:scale-95 ${
                                isDisabled 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-none' 
                                : 'bg-dark-cyan-600 hover:bg-dark-cyan-700 text-white shadow-dark-cyan-100/50'
                            }`}
                        >
                            {isWeak && !allowWeakPassword ? "Trop court ou trop faible" : "Mettre à jour"}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-x-2"
                            enterTo="opacity-100 translate-x-0"
                        >
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                <Check size={18} /> Modifié !
                            </p>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}