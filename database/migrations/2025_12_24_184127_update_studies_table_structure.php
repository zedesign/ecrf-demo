<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('studies', function (Blueprint $table) {
        // 1. Supprimer la colonne description
        $table->dropColumn('description');
        
        // 2. Ajouter la colonne start_date (après protocol_date par exemple)
        $table->date('start_date')->nullable()->after('protocol_date');
    });
}

public function down(): void
{
    Schema::table('studies', function (Blueprint $table) {
        $table->text('description')->nullable();
        $table->dropColumn('start_date');
    });
}
};
