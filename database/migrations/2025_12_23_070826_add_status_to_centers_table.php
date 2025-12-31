<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('centers', function (Blueprint $table) {
        // On ajoute la colonne avec 'active' par défaut
        $table->string('status')->default('active')->after('name'); 
    });
}

public function down(): void
{
    Schema::table('centers', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
};
