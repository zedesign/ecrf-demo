<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        // On nettoie les anciens rôles pour repartir sur une base eCRF propre
        // ATTENTION : cela va détacher les rôles des utilisateurs actuels
        Role::whereIn('guard_name', ['web'])->delete();

        $roles = [
            'super_admin',    // Contrôle total
            'study_admin',    // Admin de l'étude (eCRF Builder)
            'investigator',   // Médecin / Investigateur
            'coordinator',    // ARC Hospitalier / Coordinateur
            'monitor',        // ARC Moniteur (Vérification)
            'data_manager',   // Gestionnaire des données
            'auditor',        // Consultation pour audit
            'sponsor_admin',  // Admin côté promoteur
            'patient'         // Si le patient remplit des questionnaires (ePRO)
        ];

        foreach ($roles as $role) {
            Role::create(['name' => $role, 'guard_name' => 'web']);
        }
    }

    public function down(): void
    {
        // Optionnel : remettre les anciens si besoin
    }
};