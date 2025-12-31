import React from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";

export function RoleForm({ onSuccess }: { onSuccess: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', // Ce sera notre "display_name" (ex: Data Manager)
        slug: '', // Ce sera notre "name" technique (ex: data_manager)
    });

    // Fonction pour transformer automatiquement le nom en slug technique
    const handleNameChange = (val: string) => {
        const generatedSlug = val
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')           // Remplace espaces par underscores
            .replace(/[^\w-]+/g, '');       // Supprime les caractères spéciaux
        
        setData(prev => ({
            ...prev,
            name: val,
            slug: generatedSlug
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // On utilise la route nommée pour plus de sécurité
        post(route('admin.settings.roles.store'), {
            onSuccess: () => {
                reset();
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 pt-4">
            {/* CHAMP NOM D'AFFICHAGE */}
            <div className="space-y-2">
                <Label htmlFor="name">Nom du rôle (Affichage)</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="ex: Data Manager"
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* CHAMP SLUG (AUTO-GÉNÉRÉ) */}
            <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-500 flex items-center gap-1">
                    Slug technique <Info className="w-3 h-3" />
                </Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder="ex: data_manager"
                    className={`bg-slate-50 font-mono text-xs ${errors.slug ? "border-red-500" : ""}`}
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                <p className="text-[10px] text-slate-400">
                    C'est l'identifiant unique utilisé par le système de permissions.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="bg-dark-cyan-600 hover:bg-dark-cyan-700 text-white w-full shadow-lg"
                >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Créer le rôle métier
                </Button>
            </div>
        </form>
    );
}