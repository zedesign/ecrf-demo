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
        // On vérifie si la table n'existe pas déjà avant de la créer
        if (!Schema::hasTable('study_user')) {
            Schema::create('study_user', function (Blueprint $table) {
                $table->id();
                
                // Lien vers l'étude
                $table->foreignId('study_id')->constrained()->onDelete('cascade');
                
                // Lien vers l'utilisateur (investigateur, moniteur, etc.)
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                
                // Lien vers le centre (optionnel, car un utilisateur peut être lié 
                // à une étude globale sans être rattaché à un centre précis au début)
                $table->foreignId('center_id')->nullable()->constrained()->onDelete('set null');
                
                $table->timestamps();

                // Index pour accélérer les recherches de performances
                $table->index(['study_id', 'user_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_user');
    }
};