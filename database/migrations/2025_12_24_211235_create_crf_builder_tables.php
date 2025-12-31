<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Les Formulaires
        Schema::create('forms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('version')->default(1);
            $table->string('status')->default('draft'); // draft, published, archived
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 2. Les Sections
        Schema::create('form_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('form_id')->constrained('forms')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 3. Les Questions (Fields)
        Schema::create('form_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('section_id')->constrained('form_sections')->onDelete('cascade');
            $table->string('label');
            $table->string('field_type'); // text, number, select, date...
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('order_index')->default(0);
            
            // Le JSONB pour la configuration dynamique (options, validation)
            $table->jsonb('settings')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('form_sections');
        Schema::dropIfExists('forms');
    }
};