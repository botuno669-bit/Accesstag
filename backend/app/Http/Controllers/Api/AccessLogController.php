<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\AccessLog;

class AccessLogController extends Controller
{
    /**
     * Devuelve el historial completo de la bitácora
     */
    public function index()
    {
        return response()->json(AccessLog::with(['device.profile', 'profile'])->latest()->get(), 200);
    }

    /**
     * Escaneo en portería: Registra la entrada o la salida de un dispositivo
     */
    public function scanEntryOrExit(Request $request)
    {
        $request->validate([
            'nfc_uid' => 'required|string',
            'guarda_id' => 'required|exists:profiles,id',
            'tipo_movimiento' => 'required|in:Entrada,Salida'
        ]);

        $device = Device::where('nfc_uid', $request->nfc_uid)->first();

        // Validaciones estrictas
        if (!$device) {
            return response()->json(['error' => 'Dispositivo no encontrado en la base de datos'], 404);
        }

        if (in_array($device->estado, ['Extraviado', 'Retenido en CIC', 'Inactivo'])) {
            return response()->json([
                'error' => 'Acceso denegado, el dispositivo requiere revisión',
                'estado' => $device->estado
            ], 403);
        }

        // Crear registro en la bitácora
        $log = AccessLog::create([
            'device_id' => $device->id,
            'guarda_id' => $request->guarda_id,
            'tipo_movimiento' => $request->tipo_movimiento
        ]);

        return response()->json([
            'mensaje' => 'Registro añadido con exito',
            'registro' => $log,
            'dispositivo' => $device
        ], 201);
    }
}
