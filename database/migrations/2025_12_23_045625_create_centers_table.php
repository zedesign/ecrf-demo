<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::create('centers', function (Blueprint $table) {
        $table->id();
        
        // Informations de base
        $table->string('name'); 
        $table->string('code')->unique(); // Identifiant unique (ex: 01, ALGER-01)
        $table->string('wilaya'); 
        
        // Informations de contact
        $table->string('service_name')->nullable(); 
        $table->string('head_of_service')->nullable(); 
        $table->string('phone')->nullable();
        $table->string('email')->nullable();
        
        // Données Techniques & Sécurité
        $table->enum('structure_type', ['public', 'private', 'military', 'other'])->default('public');
        $table->boolean('is_active')->default(true);
        
        $table->timestamps();

        // Index pour accélérer les recherches fréquentes
        $table->index('is_active');
        $table->index('wilaya');
    });
}
};
