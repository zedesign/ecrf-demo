<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Gestion Patients
            'view_patients', 'create_patients', 'edit_patients',
            // Saisie eCRF (Data Entry)
            'fill_ecrf', 'edit_locked_data', 'export_data',
            // Monitoring (ARC / Promoteur)
            'create_queries', 'close_queries', 'verify_data',
            // Validation (Investigateur / DM)
            'freeze_data', 'sign_forms', 'lock_center'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
    }
}