<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            if (!Schema::hasColumn('forms', 'is_hidden')) {
                $table->boolean('is_hidden')->default(false)->after('status');
            }
        });

        Schema::table('form_sections', function (Blueprint $table) {
            if (!Schema::hasColumn('form_sections', 'is_hidden')) {
                $table->boolean('is_hidden')->default(false)->after('description');
            }
        });
    }
};
