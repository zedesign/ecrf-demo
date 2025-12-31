<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('study_audits', function (Blueprint $table) {
            $table->id();
            // L'étude concernée (supprime l'audit si l'étude est supprimée)
            $table->foreignId('study_id')->constrained()->onDelete('cascade');
            
            // L'utilisateur qui fait la modif
            $table->foreignId('user_id')->constrained(); 
            
            // Détails technique du changement
            $table->string('field_name');   // ex: 'status', 'name', 'target_inclusions'
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            
            // La justification obligatoire pour la conformité (Clinical Research)
            $table->text('reason')->nullable(); 
            
            $table->timestamps(); // created_at servira de date pour l'audit
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_audits');
    }
};