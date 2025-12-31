<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_fields', function (Blueprint $table) {
            // 1. On ajoute le champ 'name' s'il n'existe pas déjà
            if (!Schema::hasColumn('form_fields', 'name')) {
                $table->string('name')->nullable()->after('section_id');
            }

            // 2. On s'assure que settings est bien en JSONB (Postgres)
            // Si la colonne existe déjà, on ne fait rien, sinon on l'ajoute
            if (!Schema::hasColumn('form_fields', 'settings')) {
                $table->jsonb('settings')->nullable();
            }
        });

        // 3. Changement du type de 'order' de INT vers DECIMAL
        // On utilise DB::statement car Laravel change parfois mal les types sur Postgres
        DB::statement('ALTER TABLE form_fields ALTER COLUMN "order" TYPE DECIMAL(8,2) USING "order"::decimal');
    }

    public function down(): void
    {
        Schema::table('form_fields', function (Blueprint $table) {
            // Revenir en arrière si nécessaire
            $table->integer('order')->change();
        });
    }
};