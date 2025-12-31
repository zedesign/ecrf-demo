<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::create('studies', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Nom public
        $table->string('protocol_code')->unique(); // ID Interne (ex: ABC-2025)
        
        // Versioning demandé
        $table->string('protocol_version'); // ex: "v1.0.2"
        $table->date('protocol_date'); // Date officielle de validation du protocole
        
        $table->enum('phase', ['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Observational']);
        $table->enum('status', ['Draft', 'Active', 'Closed', 'Archived'])->default('Draft');
        
        $table->integer('target_inclusions')->default(0);
        $table->string('therapeutic_area')->nullable(); // ex: Oncologie
        $table->text('description')->nullable();
        
        $table->timestamps();
    });
}
};
