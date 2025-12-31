<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('studies', function (Blueprint $table) {
            // On ajoute sponsor_id seulement s'il n'existe pas
            if (!Schema::hasColumn('studies', 'sponsor_id')) {
                $table->foreignId('sponsor_id')->nullable()->constrained('users')->onDelete('set null');
            }
            
            // On ajoute target_inclusions seulement s'il n'existe pas
            if (!Schema::hasColumn('studies', 'target_inclusions')) {
                $table->integer('target_inclusions')->default(0);
            }
            
            // On ajoute status seulement s'il n'existe pas
            if (!Schema::hasColumn('studies', 'status')) {
                $table->string('status')->default('Draft');
            }
        });
    }

    public function down(): void
    {
        Schema::table('studies', function (Blueprint $table) {
            // Suppression sécurisée
            if (Schema::hasColumn('studies', 'sponsor_id')) {
                $table->dropForeign(['sponsor_id']);
                $table->dropColumn('sponsor_id');
            }
            if (Schema::hasColumn('studies', 'target_inclusions')) {
                $table->dropColumn('target_inclusions');
            }
            if (Schema::hasColumn('studies', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};