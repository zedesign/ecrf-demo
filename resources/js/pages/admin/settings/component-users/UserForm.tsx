import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Search, ShieldCheck, Mail, User, Building2 } from "lucide-react";

interface SimpleUser {
    id: number;
    name: string;
    email: string;
    center_id?: number | string;
    must_create_password?: boolean;
    roles?: Array<{ name: string }>;
}

interface UserFormProps {
    onSuccess: () => void;
    centers: any[];
    roles: any[]; // <-- Ajoutez cette ligne
    user?: SimpleUser | null;
}

export function UserForm({ onSuccess, centers, roles, user }: UserFormProps) {
    
    // Initialisation du formulaire
    const { data, setData, post, put, processing, errors, reset } = useForm({
            name: (user?.name || '') as string,
            email: (user?.email || '') as string,
            password: '' as string, 
            role: (user?.roles && user.roles.length > 0 ? user.roles[0].name : '') as string, 
            center_id: (user?.center_id ? String(user.center_id) : '') as string,
            must_create_password: (user ? (user.must_create_password ?? false) : true) as boolean,
        });

    // Synchronisation des données quand l'utilisateur à éditer change
    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
                center_id: user.center_id ? String(user.center_id) : '',
                // Le !! transforme 1 en true, 0 en false, et null en false
                must_create_password: user ? Boolean(user.must_create_password) : true,
            });
        }
    }, [user]);

    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (user) {
            put(`/admin/settings/users/${user.id}`, {
                onSuccess: () => onSuccess(),
            });
        } else {
            post('/admin/settings/users', {
                onSuccess: () => {
                    reset();
                    onSuccess();
                },
            });
        }
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let retVal = "";
        for (let i = 0; i < 14; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setData(prev => ({
            ...prev,
            password: retVal,
            must_create_password: false
        }));
    };

    const filteredCenters = (centers || []).filter(center => 
        center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCenter = (centers || []).find(c => c.id.toString() === data.center_id);

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "";
        return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
            {/* Section Identification */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <User className="w-4 h-4 text-slate-400" /> Nom & Prénom
                    </Label>
                    <Input 
                        className="h-11 focus-visible:ring-dark-cyan-600"
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        placeholder="Ex: Mohamed Alami" 
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400" /> Adresse Email
                    </Label>
                    <Input 
                        className="h-11 focus-visible:ring-dark-cyan-600"
                        type="email" 
                        value={data.email} 
                        onChange={e => setData('email', e.target.value)} 
                        placeholder="contact@exemple.dz" 
                    />
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>
            </div>

            {/* Section Sécurité */}
            <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
                <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="must_create" 
                        className="w-5 h-5 border-slate-300 data-[state=checked]:bg-dark-cyan-600 data-[state=checked]:border-dark-cyan-600"
                        checked={data.must_create_password}
                        onCheckedChange={(checked) => setData('must_create_password', !!checked)}
                    />
                    <Label htmlFor="must_create" className="text-sm font-medium cursor-pointer text-slate-700">
                        L'utilisateur doit créer son mot de passe à la première connexion
                    </Label>
                </div>
                
                <div className="flex gap-2 relative">
                    <Input 
                        type="text"
                        disabled={data.must_create_password}
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        placeholder={data.must_create_password ? "Mot de passe auto-généré par le système" : "Saisir un mot de passe"}
                        className={`h-11 bg-white pr-12 transition-all focus-visible:ring-dark-cyan-600 ${data.must_create_password ? 'opacity-50 border-dashed' : ''}`}
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-11 w-11 shrink-0 border-slate-200 hover:bg-white hover:text-dark-cyan-600 transition-colors"
                        onClick={generatePassword}
                        disabled={data.must_create_password}
                    >
                        <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Section Rôle & Centre */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-slate-400" /> Rôle
                    </Label>
                        <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                            <SelectTrigger className="h-11 bg-white focus:ring-dark-cyan-600">
                                <SelectValue placeholder="Attribuer un rôle" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 shadow-xl z-[110]">
                                <div className="max-h-[280px] overflow-y-auto p-1">
                                    {/* On ajoute (roles || []) pour éviter le crash si roles est undefined */}
                                    {(roles || []).map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name
                                                .split('_')
                                                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                                                .join(' ')}
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    {errors.role && <p className="text-xs text-red-500 font-medium">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-400" /> Centre de rattachement
                    </Label>
                    <Select value={data.center_id} onValueChange={(v) => setData('center_id', v)}>
                        <SelectTrigger className="h-11 bg-white focus:ring-dark-cyan-600 w-full overflow-hidden">
                            <SelectValue placeholder="Choisir un centre">
                                {selectedCenter ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-100 rounded text-emerald-700">
                                            <Building2 className="h-3 w-3" />
                                        </div>
                                        <span className="font-semibold text-sm truncate">
                                            {selectedCenter.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-slate-500">Choisir un centre</span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        
                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] bg-white shadow-xl border-slate-200 overflow-hidden">
                            <div className="sticky top-0 bg-white p-2 border-b z-10">
                                <div className="flex items-center px-3 h-10 rounded-md bg-slate-100">
                                    <Search className="w-4 h-4 mr-2 text-slate-400" />
                                    <input 
                                        className="text-sm w-full bg-transparent outline-none placeholder:text-slate-500" 
                                        placeholder="Rechercher un centre..."
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-1 max-h-60 overflow-y-auto">
                                {filteredCenters.map(center => (
                                    <SelectItem 
                                        key={center.id} 
                                        value={center.id.toString()} 
                                        className="py-3 px-2 cursor-pointer transition-colors rounded-lg mb-1"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-slate-900 truncate">
                                                {truncateText(center.name, 30)}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {center.location || 'Algérie'}
                                            </span>
                                        </div>
                                    </SelectItem>   
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                    {errors.center_id && <p className="text-xs text-red-500 font-medium">{errors.center_id}</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="flex-1 h-12 bg-dark-cyan-700 text-white hover:bg-dark-cyan-800 font-bold text-base shadow-lg shadow-dark-cyan-100/50"
                >
                    {processing ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</>
                    ) : (
                        user ? "Enregistrer les modifications" : "Créer le compte utilisateur"
                    )}
                </Button>
            </div>
        </form>
    );
}