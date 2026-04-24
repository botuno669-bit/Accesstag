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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('supabase_user_id')->nullable()->unique()->comment('Vinculación con Supabase Auth');
            $table->string('nombre_completo');
            $table->string('tipo_documento', 20);
            $table->string('numero_documento', 50)->unique();
            $table->string('rol')->default('Aprendiz')->comment('Roles: Administrador, Guarda, Aprendiz, Instructor');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
