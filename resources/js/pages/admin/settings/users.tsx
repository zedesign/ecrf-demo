import React, { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus, Clock, AlertTriangle } from "lucide-react";
import { router } from '@inertiajs/react';
import { Input } from "@/components/ui/input";
import { UserForm } from "./component-users/UserForm";


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

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

const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

interface UsersProps {
    users: any[];
    roles: any[];   // Doit correspondre à Role::all() du contrôleur
    centers: any[]; // Doit correspondre à ce que vous envoyez pour les centres
}

const ROLE_LABELS: Record<string, { label: string, color: string }> = {
    'super_admin':   { label: 'Super Admin', color: 'bg-red-50 text-red-700 border-red-100' },
    'study_admin':   { label: 'Admin Étude', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    'investigator':  { label: 'Investigateur', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    'coordinator':   { label: 'Coordinateur', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
    'monitor':       { label: 'Moniteur / ARC', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'data_manager':  { label: 'Data Manager', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'auditor':       { label: 'Auditeur', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    'sponsor_admin': { label: 'Promoteur', color: 'bg-slate-50 text-slate-700 border-slate-100' },
    'patient':       { label: 'Patient', color: 'bg-pink-50 text-pink-700 border-pink-100' },
};

export function UsersSection({ users, roles, centers }: UsersProps) {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any | null>(null);
    const [userToDelete, setUserToDelete] = useState<{id: number, name: string} | null>(null);
    const [confirmText, setConfirmText] = useState("");
    const deleteWord = "SUPPRIMER";

    const handleSuccess = () => {
        setIsAddUserOpen(false); // Ferme le modal
        setUserToEdit(null);     // Réinitialise l'utilisateur sélectionné
    };

    const handleConfirmDelete = () => {
        if (userToDelete && confirmText === deleteWord) {
            
            // On utilise l'URL relative de l'API Laravel 
            // sans passer par la fonction route() qui plante chez toi
            router.delete(`/admin/settings/users/${userToDelete.id}`, {
                onSuccess: () => {
                    setUserToDelete(null);
                    setConfirmText("");
                },
                onError: (errors) => {
                    console.error("Erreur Laravel :", errors);
                    alert("Erreur lors de la suppression. Vérifiez la console.");
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">Membres de l'équipe</h2>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 rounded-full px-2">
                        {users.length} utilisateurs
                    </Badge>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-white border text-slate-700 hover:bg-slate-50 shadow-sm gap-2 font-bold">
                            <Plus className="w-4 h-4" /> Ajouter un utilisateur
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Créer un utilisateur</DialogTitle>
                        </DialogHeader>

                        <DialogDescription className="text-slate-500">
                            Remplissez les informations ci-dessous pour créer un nouveau compte utilisateur et lui assigner un centre.
                        </DialogDescription>
                        
                        {/* On passe la fonction pour fermer le modal quand c'est fini */}
                        <UserForm 
                                onSuccess={handleSuccess} 
                                centers={centers} 
                                roles={roles} // On passe les rôles fetchés ici
                                user={userToEdit} 
                            />
                        
                    </DialogContent>
                </Dialog>
                {/* Modal de Mise à jour */}
                <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
                    <DialogContent className="sm:max-w-[600px] bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>
                                Modifiez les informations de <strong>{userToEdit?.name}</strong> ci-dessous.
                            </DialogDescription>
                        </DialogHeader>

                        {userToEdit && (
                        <UserForm 
                            onSuccess={handleSuccess} 
                            centers={centers} 
                            roles={roles}
                            user={userToEdit} 
                        />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[280px]">Nom</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Adresse Email</TableHead>
                            <TableHead>Centre</TableHead>
                            <TableHead>Dernière Connexion</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-100">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{user.name}</span>
                                            <span className="text-xs text-slate-500">@{user.username || user.name.toLowerCase().replace(' ', '')}</span>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge className={`rounded-full px-2.5 py-0.5 font-medium border-0 ${
                                        !user.must_create_password 
                                        ? "bg-emerald-50 text-emerald-700" 
                                        : "bg-orange-50 text-orange-700"
                                    }`}>
                                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                                        {!user.must_create_password ? "Active" : "Pending"}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {user.roles?.map((role: any) => {
                                        const config = ROLE_LABELS[role.name] || { label: role.name, color: 'bg-gray-50' };
                                        return (
                                            <Badge 
                                                key={role.id} 
                                                variant="outline" 
                                                className={`rounded-full px-3 font-semibold border ${config.color}`}
                                            >
                                                {config.label}
                                            </Badge>
                                        );
                                    })}
                                </TableCell>

                                <TableCell className="text-slate-500">
                                    {user.email}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600 bg-white px-3 font-normal">
                                        {user.center?.name || 'Général'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {user.is_online ? (
                                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg w-fit">
                                            {/* Le petit cercle avec l'effet de pulsation */}
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                                En ligne
                                            </span>
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 rounded-lg px-2 py-1 font-medium gap-1.5 border-none">
                                            <Clock className="w-3 h-3" />
                                            {user.last_login_at ? formatLastSeen(user.last_login_at) : "Jamais"}
                                        </Badge>
                                    )}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 transition-colors"
                                            onClick={() => setUserToDelete({id: user.id, name: user.name})}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-slate-900 transition-colors"
                                            onClick={() => setUserToEdit(user)} // <-- Ajoute ceci
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Supprimer définitivement ?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild className="space-y-4 pt-2">
                            <div>
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        Attention : Cette action est irréversible. L'utilisateur <strong>{userToDelete?.name}</strong> perdra tout accès à la plateforme.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                        Tapez <span className="text-red-600">"{deleteWord}"</span> pour confirmer
                                    </p>
                                    <Input 
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder={deleteWord}
                                        className="h-11 text-center font-bold tracking-widest focus:ring-red-500 border-slate-200 uppercase"
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setConfirmText("");
                                    setUserToDelete(null);
                                }}
                                className="font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none shadow-none rounded-xl transition-colors"
                            >
                                Annuler
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                             <Button
                                onClick={handleConfirmDelete}
                                disabled={confirmText !== deleteWord}
                                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Supprimer définitivement
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}