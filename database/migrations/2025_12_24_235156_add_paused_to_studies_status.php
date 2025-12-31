<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. On supprime l'ancienne contrainte CHECK (Postgres la nomme souvent ainsi : table_colonne_check)
        // Si tu ne connais pas le nom exact, on peut forcer la suppression par précaution
        DB::statement('ALTER TABLE studies DROP CONSTRAINT IF EXISTS studies_status_check');

        // 2. On recrée la contrainte avec la nouvelle liste de valeurs
        DB::statement("ALTER TABLE studies ADD CONSTRAINT studies_status_check CHECK (status IN ('Draft', 'Active', 'Paused', 'Closed', 'Archived'))");
    }

    public function down(): void
    {
        // On fait l'inverse : on remet l'ancienne contrainte
        DB::statement('ALTER TABLE studies DROP CONSTRAINT IF EXISTS studies_status_check');
        DB::statement("ALTER TABLE studies ADD CONSTRAINT studies_status_check CHECK (status IN ('Draft', 'Active', 'Closed', 'Archived'))");
    }
};