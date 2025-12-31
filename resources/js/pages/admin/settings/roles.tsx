import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Settings2, Shield, Lock, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { RoleForm } from "./component-users/RoleForm"; 
import { ManagePermissionsDialog } from "@/pages/admin/settings/component-users/ManagePermissionsDialog";
import { router } from '@inertiajs/react';
import { EditRoleForm } from "./component-users/EditRoleForm";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RolesSection({ roles, allPermissions }: { roles: any[], allPermissions: any[] }) {
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [editingRoleForName, setEditingRoleForName] = useState<any>(null);

    const [roleToDelete, setRoleToDelete] = useState<any>(null);
    const [confirmText, setConfirmText] = useState("");
    const deleteWord = "SUPPRIMER"; // Le mot à taper pour confirmer

    const handleDelete = (role: any) => {
        // Au lieu de lancer le confirm() du navigateur, on stocke le rôle à supprimer.
        // Cela va déclencher l'ouverture de ton <AlertDialog open={!!roleToDelete}>
        setRoleToDelete(role);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Rôles & Permissions</h2>
                        <p className="text-sm text-slate-500">Configurez les droits d'accès métier pour l'eCRF</p>
                    </div>
                </div>

                {/* Dialogue de création de rôle */}
                <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm gap-2 font-bold px-4">
                            <Plus className="w-4 h-4" /> Nouveau rôle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Nouveau rôle</DialogTitle>
                            <DialogDescription>Définissez un nouveau groupe de privilèges.</DialogDescription>
                        </DialogHeader>
                        <RoleForm onSuccess={() => setIsAddRoleOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow>
                        <TableHead className="w-[250px]">Nom du rôle</TableHead>
                        <TableHead className="w-[150px]">Slug technique</TableHead>
                        <TableHead>Guard</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Configuration</TableHead>
                    </TableRow>
                </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id} className="group hover:bg-slate-50/50 transition-colors">
                                {/* COLONNE 1 : NOM D'AFFICHAGE (DISPLAY NAME) */}
                                <TableCell className="font-semibold text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <Shield className={`w-4 h-4 ${role.name === 'admin' ? 'text-red-500' : 'text-indigo-500'}`} />
                                        {/* On affiche le display_name s'il existe, sinon on formate le name par défaut */}
                                        <span className="capitalize">
                                            {role.display_name || role.name.replace('_', ' ')}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* COLONNE 2 : SLUG TECHNIQUE (BADGE) */}
                                <TableCell>
                                    <code className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-mono border border-slate-200">
                                        {role.name}
                                    </code>
                                </TableCell>

                                {/* COLONNE 3 : GUARD (Facultatif, tu peux le garder ou le supprimer) */}
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 uppercase">
                                        {role.guard_name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 gap-1">
                                        <Lock className="w-3 h-3" />
                                        {role.permissions?.length || 0} droits
                                    </Badge>
                                </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* BOUTON ÉDITER LE NOM */}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setEditingRoleForName(role)} // Nouvel état pour un popup de renommage
                                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Button>

                                            {/* BOUTON GÉRER LES DROITS (Déjà fait) */}
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setEditingRole(role)}
                                                className="text-slate-600 hover:text-dark-cyan-700 gap-2 border-slate-200"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                                Droits
                                            </Button>

                                            {/* BOUTON SUPPRIMER */}
                                            {role.name !== 'admin' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(role)}
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogue de gestion des permissions (S'ouvre au clic sur Gérer les droits) */}
            <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
                <DialogContent className="sm:max-w-[500px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-dark-cyan-600" />
                            Droits pour : {editingRole?.name.toUpperCase()}
                        </DialogTitle>
                        <DialogDescription>
                            Cochez les actions autorisées pour ce rôle dans le système eCRF.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {editingRole && (
                        <ManagePermissionsDialog 
                            role={editingRole} 
                            allPermissions={allPermissions} 
                            onClose={() => setEditingRole(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>
            {/* --- DIALOGUE 2 : MODIFICATION DU NOM (À AJOUTER) --- */}
            <Dialog open={!!editingRoleForName} onOpenChange={(open) => !open && setEditingRoleForName(null)}>
                <DialogContent className="bg-white sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Modifier le nom du rôle</DialogTitle>
                        <DialogDescription className="pt-2 text-slate-500 text-sm">
                            Modifiez le nom d'affichage de ce rôle. Cela n'affectera pas les permissions ni l'identifiant technique (slug) utilisé par le système.
                        </DialogDescription>
                    </DialogHeader>
                    {editingRoleForName && (
                        <EditRoleForm 
                            role={editingRoleForName} 
                            onSuccess={() => setEditingRoleForName(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* --- DIALOGUE 3 : SUPRESSION ROLE --- */}
            <AlertDialog open={!!roleToDelete} onOpenChange={(open) => {
                if(!open) {
                    setRoleToDelete(null);
                    setConfirmText("");
                }
            }}>
                <AlertDialogContent className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            Supprimer le rôle définitivement ?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild className="space-y-4 pt-2">
                            <div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        Attention : Cette action est irréversible. Le rôle <strong>{roleToDelete?.display_name || roleToDelete?.name}</strong> sera supprimé. 
                                        Les utilisateurs ayant ce rôle pourraient perdre leurs accès.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">
                                        Tapez <span className="text-red-600">"{deleteWord}"</span> pour confirmer
                                    </p>
                                    <Input 
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                        placeholder={deleteWord}
                                        className="h-12 text-center font-black tracking-[0.3em] focus-visible:ring-red-500 border-slate-200 uppercase rounded-xl"
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="bg-slate-50/50 p-4 -m-6 mt-4 gap-3">
                        <AlertDialogCancel asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setConfirmText("");
                                    setRoleToDelete(null);
                                }}
                                className="font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none shadow-none rounded-xl transition-colors"
                            >
                                Annuler
                            </Button>
                        </AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button
                                    onClick={() => {
                                        // Ajoute le point d'interrogation ici : roleToDelete?.id
                                        if (roleToDelete?.id) {
                                            router.delete(route('admin.settings.roles.destroy', roleToDelete.id), {
                                                onSuccess: () => {
                                                    setRoleToDelete(null);
                                                    setConfirmText("");
                                                }
                                            });
                                        }
                                    }}
                                    disabled={confirmText !== deleteWord}
                                    className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-30 font-bold px-8 rounded-xl"
                                >
                                    Confirmer la suppression
                                </Button>
                            </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}