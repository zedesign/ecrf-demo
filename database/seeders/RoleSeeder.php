<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // SYSTEM
        Role::create(['name' => 'super_admin']);

        // SPONSOR
        Role::create(['name' => 'sponsor_admin']);
        Role::create(['name' => 'sponsor_viewer']);

        // STUDY MANAGEMENT
        Role::create(['name' => 'study_admin']);

        // SITE / CENTRE
        Role::create(['name' => 'investigator']);
        Role::create(['name' => 'coordinator']);

        // DATA & QUALITY
        Role::create(['name' => 'monitor']);
        Role::create(['name' => 'data_manager']);
        Role::create(['name' => 'auditor']);
    }
}
