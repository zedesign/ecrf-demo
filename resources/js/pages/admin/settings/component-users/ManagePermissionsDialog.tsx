import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";
import { Loader2, ShieldCheck, Database, FileText, Activity } from "lucide-react";

// On définit les groupes pour l'eCRF
const PERMISSION_GROUPS: Record<string, { icon: LucideIcon, perms: string[] }> = {
    "Gestion Patients": {
        icon: Activity,
        perms: ["view_patients", "create_patients", "edit_patients"]
    },
    "Saisie & Données": {
        icon: Database,
        perms: ["fill_ecrf", "edit_locked_data", "export_data"]
    },
    "Monitoring & Queries": {
        icon: FileText,
        perms: ["create_queries", "close_queries", "verify_data"]
    },
    "Validation & Sécurité": {
        icon: ShieldCheck,
        perms: ["freeze_data", "sign_forms", "lock_center"]
    }
};

// Définis l'interface juste avant ton composant
interface ManagePermissionsProps {
    role: {
        id: number;
        name: string;
        permissions?: Array<{ name: string }>;
    };
    allPermissions: any[];
    onClose: () => void;
}

export function ManagePermissionsDialog({ role, allPermissions, onClose }: ManagePermissionsProps) {
    // Initialisation du formulaire avec Inertia
    const { data, setData, post, processing } = useForm<{ permissions: string[] }>({
        permissions: role.permissions ? role.permissions.map((p) => p.name) : [],
    });

    const togglePermission = (permName: string) => {
        const current = [...data.permissions];
        const index = current.indexOf(permName);
        
        if (index > -1) {
            current.splice(index, 1); // On retire si déjà présent
        } else {
            current.push(permName); // On ajoute si absent
        }
        setData('permissions', current);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Route vers RoleController@updatePermissions
        post(route('admin.settings.roles.permissions', role.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid gap-6">
                    {Object.entries(PERMISSION_GROUPS).map(([groupName, groupData]) => (
                        <div key={groupName} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                            <div className="flex items-center gap-2 text-dark-cyan-700 mb-2">
                                <groupData.icon className="w-4 h-4" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">{groupName}</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {groupData.perms.map((permName) => (
                                    <div key={permName} className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-dark-cyan-200">
                                        <Checkbox 
                                            id={`${role.id}-${permName}`}
                                            checked={data.permissions.includes(permName)}
                                            onCheckedChange={() => togglePermission(permName)}
                                            className="data-[state=checked]:bg-dark-cyan-600 data-[state=checked]:border-dark-cyan-600"
                                        />
                                        <Label 
                                            htmlFor={`${role.id}-${permName}`}
                                            className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                                        >
                                            {permName.replace(/_/g, ' ').toUpperCase()}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose}
                    className="text-slate-500"
                >
                    Annuler
                </Button>
                <Button 
                    disabled={processing} 
                    className="bg-dark-cyan-600 hover:bg-dark-cyan-700 text-white px-8 rounded-xl"
                >
                    {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    Enregistrer les droits
                </Button>
            </div>
        </form>
    );
}