<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void {
    if (!Schema::hasTable('center_study')) {
        Schema::create('center_study', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_id')->constrained()->onDelete('cascade');
            $table->foreignId('center_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }
}
};
