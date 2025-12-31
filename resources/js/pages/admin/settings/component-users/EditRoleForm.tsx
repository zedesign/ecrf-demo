import React from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RoleFormData {
    name: string;
}

export function EditRoleForm({ role, onSuccess }: { role: any, onSuccess: () => void }) {
    // On initialise avec le display_name actuel du rôle
    const { data, setData, put, processing, errors } = useForm<RoleFormData>({
        name: role.display_name || role.name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // On utilise PUT pour la mise à jour
        put(route('admin.settings.roles.update', role.id), {
            onSuccess: () => onSuccess(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="edit-name">Nom d'affichage</Label>
                <Input
                    id="edit-name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="ex: Médecin Investigateur"
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                <p className="text-[10px] text-slate-400 italic">
                    Note : L'identifiant technique (slug) ne peut pas être modifié pour garantir la stabilité du système.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="flex-1 h-12 bg-dark-cyan-700 text-white hover:bg-dark-cyan-800 font-bold text-base shadow-lg shadow-dark-cyan-100/50"
                >
                    {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Enregistrer les modifications
                </Button>
            </div>
        </form>
    );
}