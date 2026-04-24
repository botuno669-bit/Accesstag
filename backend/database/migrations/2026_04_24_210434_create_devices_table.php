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
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->onDelete('cascade')->comment('Dueño del dispositivo');
            $table->string('nfc_uid')->unique()->comment('ID de la etiqueta de hardware');
            $table->string('tipo')->comment('Ej: Portatil, Tablet, Celular');
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->string('color')->nullable();
            $table->string('numero_serie')->nullable();
            $table->string('estado')->default('Activo')->comment('Activo, Inactivo, Retenido en CIC, Extraviado');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
