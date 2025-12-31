<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Les Soumissions (Instance de formulaire rempli)
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('form_id')->constrained('forms');
            $table->uuid('patient_id'); // Id du patient dans ton système
            $table->string('status')->default('draft'); // draft, completed, locked
            $table->uuid('created_by')->nullable(); // Id de l'utilisateur/médecin
            $table->timestamps();
        });

        // 2. Les Valeurs saisies (Données cliniques)
        Schema::create('field_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('submission_id')->constrained('submissions')->onDelete('cascade');
            $table->foreignUuid('field_id')->constrained('form_fields');
            
            $table->text('value')->nullable(); // Valeur simple
            $table->jsonb('value_json')->nullable(); // Valeur complexe (ex: multiselect)
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_values');
        Schema::dropIfExists('submissions');
    }
};