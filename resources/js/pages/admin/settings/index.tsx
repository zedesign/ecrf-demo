import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; 
import { BreadcrumbItem } from '@/types';

// Importation des sections depuis les fichiers voisins
import { UsersSection } from './users';
import { RolesSection } from './roles';
import { AuditTrailSection } from './audit-trail';
import { CentersSection } from "./centers";

export default function SettingsIndex() {
    // CORRECTION : On ajoute "centers = []" ici pour extraire la donnée envoyée par Laravel
    const { 
        users = [], 
        roles = [], 
        allPermissions = [],
        audits = [], 
        centers = [],
        currentTab = 'users' 
    } = usePage().props as any;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '/admin/settings/users' },
        { 
            title: currentTab === 'audits' 
                ? 'Audit Trail' 
                : currentTab === 'centers' 
                    ? 'Centres' 
                    : currentTab.charAt(0).toUpperCase() + currentTab.slice(1), 
            href: '#' 
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Admin - ${currentTab}`} />

            <div className="flex flex-col space-y-6 p-6">
                
                {/* TITRE DYNAMIQUE */}
                <div>
                    <h1 className="text-2xl font-black text-dark-cyan-950 tracking-tight capitalize">
                        {currentTab === 'audits' ? "Journal d'Audit" : 
                         currentTab === 'centers' ? "Centres Hospitaliers" : 
                         currentTab}
                    </h1>
                    <p className="text-sm text-dark-cyan-600 font-medium mt-1">
                        {currentTab === 'users' && "Gestion des comptes utilisateurs et des accès au système."}
                        {currentTab === 'roles' && "Configuration des permissions et des rôles de sécurité."}
                        {currentTab === 'audits' && "Traçabilité complète des actions effectuées sur les données."}
                        {currentTab === 'centers' && "Administration des centres de rattachement et structures médicales."}
                    </p>
                </div>

                {/* CONTENEUR DE CONTENU UNIQUE */}
                <div className="rounded-3xl border border-dark-cyan-100/60 bg-white shadow-sm overflow-hidden mb-8">
                    {currentTab === 'users' && (<UsersSection users={users} roles={roles} centers={centers} />)}
                    {currentTab === 'roles' && <RolesSection roles={roles} allPermissions={allPermissions} />}
                    {currentTab === 'audits' && <AuditTrailSection audits={audits} />}
                    {currentTab === 'centers' && <CentersSection centers={centers} users={users} />}
                </div>
            </div>
        </AppLayout>
    );
}