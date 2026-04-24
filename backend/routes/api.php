<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\AccessLogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dispositivos
Route::prefix('devices')->group(function () {
    Route::post('/', [DeviceController::class, 'store']); // Regitra Nuevo
    Route::get('/', [DeviceController::class, 'index']); // Lista Todos
    Route::get('/nfc/{nfc_uid}', [DeviceController::class, 'showByNfc']); // Buscar para validar en frontend
});

// Entradas y Salidas
Route::prefix('access')->group(function () {
    Route::post('/scan', [AccessLogController::class, 'scanEntryOrExit']); // Escaneo de Portería
    Route::get('/logs', [AccessLogController::class, 'index']); // Ver bitácora
});
