import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ClipboardCheck, Copy, Eye, EyeOff, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
}

export default function InitialPasswordForm({ data, setData, errors, processing }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-slate-200' });
    const [allowWeakPassword, setAllowWeakPassword] = useState(false);

    const generateStrongPassword = () => {
        // 1. Définition des groupes de caractères
        const sets = {
            upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
            lower: "abcdefghjkmnpqrstuvwxyz",
            number: "23456789",
            special: "!@#$%&*+"
        };

        // 2. On s'assure d'avoir AU MOINS un caractère de chaque groupe
        let passwordArray = [
            sets.upper[crypto.getRandomValues(new Uint32Array(1))[0] % sets.upper.length],
            sets.lower[crypto.getRandomValues(new Uint32Array(1))[0] % sets.lower.length],
            sets.number[crypto.getRandomValues(new Uint32Array(1))[0] % sets.number.length],
            sets.special[crypto.getRandomValues(new Uint32Array(1))[0] % sets.special.length],
        ];

        // 3. On complète jusqu'à 16 caractères avec un mélange total
        const allChars = Object.values(sets).join('');
        const extraLength = 12; // 16 total - 4 déjà générés
        const randomValues = crypto.getRandomValues(new Uint32Array(extraLength));
        
        for (let i = 0; i < extraLength; i++) {
            passwordArray.push(allChars[randomValues[i] % allChars.length]);
        }

        // 4. On mélange l'array (pour que les 4 premiers caractères forcés ne soient pas toujours au début)
        const shuffledPassword = passwordArray
            .map(value => ({ value, sort: crypto.getRandomValues(new Uint32Array(1))[0] }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .join('');
        
        // 5. Mise à jour de l'état
        setData('password', shuffledPassword);
        setData('password_confirmation', shuffledPassword);
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
        if (len >= 6) score = len < 8 ? 1 : 2;
        if (len >= 8) {
            if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
            if (/[^A-Za-z0-9]/.test(pwd) && len >= 10) score += 1;
        }
        
        const levels = [
            { label: 'Faible', color: 'bg-red-500' },
            { label: 'Moyen', color: 'bg-orange-500' },
            { label: 'Fort', color: 'bg-emerald-500' },
            { label: 'Très robuste', color: 'bg-blue-600' },
            { label: 'Excellent', color: 'bg-indigo-600' },
        ];

        const finalScore = Math.min(score, levels.length - 1);
        setStrength({ score: (finalScore / 4) * 100, ...levels[finalScore] });
    }, [data.password]);

    const isWeak = data.password.length > 0 && (data.password.length < 8 || strength.score < 50);

    return (
        <div className="grid gap-4 animate-in slide-in-from-left-2 duration-500">
            {/* BLOC ALERTE PREMIÈRE CONNEXION */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                            Première connexion détectée
                        </h4>
                        <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                            Veuillez définir votre mot de passe pour sécuriser votre compte. 
                            <strong> Note importante :</strong> Assurez-vous de le noter ou de l'enregistrer dans un gestionnaire de mots de passe, car vous en aurez besoin pour vos prochaines connexions.
                        </p>
                    </div>
                </div>
            </div>
            {/* NOUVEAU MOT DE PASSE */}
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <button type="button" onClick={generateStrongPassword} className="flex items-center gap-1.5 text-xs font-bold text-dark-cyan-600 hover:underline">
                        <RefreshCw size={14} /> Générer
                    </button>
                </div>
                
                <div className="relative flex items-center">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={`h-12 pr-24 rounded-xl ${isWeak && !allowWeakPassword ? 'border-orange-500 ring-orange-500/20' : ''}`}
                        placeholder="8 caractères minimum"
                        required
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
                    <div className="mt-1 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-muted-foreground">Force</span>
                            <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: `${Math.max(strength.score, 10)}%` }} />
                        </div>

                        {isWeak && (
                            <div className="flex items-center space-x-2 rounded-xl border border-orange-200 bg-orange-50 p-3 animate-in fade-in zoom-in duration-200">
                                <Checkbox 
                                    id="allow-weak" 
                                    checked={allowWeakPassword}
                                    onCheckedChange={(checked) => setAllowWeakPassword(checked === true)}
                                    // On force le style orange ici via la prop className
                                    className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <label 
                                    htmlFor="allow-weak" 
                                    className="text-xs font-bold text-orange-700 cursor-pointer flex-1"
                                >
                                    Autoriser un mot de passe faible
                                </label>
                            </div>
                        )}
                    </div>
                )}
                <InputError message={errors.password} />
            </div>

            {/* CONFIRMATION */}
            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                <div className="relative">
                    <Input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="h-12 rounded-xl pr-10"
                        placeholder="Confirmez le mot de passe"
                        required
                    />
                </div>
                <InputError message={errors.password_confirmation} />
            </div>
        </div>
    );
}