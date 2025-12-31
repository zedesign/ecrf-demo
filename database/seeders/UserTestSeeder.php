<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserTestSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Liste propre des rôles techniques (utilisés pour les clés du tableau React)
        $roles = [
            'super_admin',
            'study_admin',
            'investigator',
            'coordinator',
            'monitor',
            'data_manager',
            'auditor',
            'sponsor_admin',
            'patient'
        ];

        // Création des rôles dans la table 'roles'
        foreach ($roles as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }

        // 2. Création de 3 utilisateurs de test avec des rôles différents
        $testUsers = [
            [
                'name' => 'Olivia Rhye',
                'email' => 'olivia@example.com',
                'role' => 'super_admin',
                'must_create_password' => false,
                'last_login_at' => now()->subHours(2),
            ],
            [
                'name' => 'Phoenix Baker',
                'email' => 'phoenix@example.com',
                'role' => 'investigator',
                'must_create_password' => false,
                'last_login_at' => now()->subDays(1),
            ],
            [
                'name' => 'Lana Steiner',
                'email' => 'lana@example.com',
                'role' => 'coordinator',
                'must_create_password' => true,
                'last_login_at' => null,
            ],
        ];

        foreach ($testUsers as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'must_create_password' => $userData['must_create_password'],
                    'last_login_at' => $userData['last_login_at'],
                    'email_verified_at' => now(),
                ]
            );
            
            // On lie l'utilisateur au rôle
            $user->syncRoles([$userData['role']]);
        }
    }
}