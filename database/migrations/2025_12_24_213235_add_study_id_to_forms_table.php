<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('forms', function (Blueprint $table) {
        // On utilise foreignId au lieu de foreignUuid 
        // car ta table 'studies' utilise des IDs numériques (BigInt)
        $table->foreignId('study_id')
              ->after('id')
              ->constrained('studies')
              ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('forms', function (Blueprint $table) {
        $table->dropForeign(['study_id']);
        $table->dropColumn('study_id');
    });
}
};
