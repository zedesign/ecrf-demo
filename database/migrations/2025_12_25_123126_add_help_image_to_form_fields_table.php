<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
    {
        Schema::table('form_fields', function (Blueprint $table) {
            $table->string('help_image')->nullable()->after('help_text');
        });
    }
};
