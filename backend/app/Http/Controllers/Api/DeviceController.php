<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;

class DeviceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retornar todos los dispositivos activos
        return response()->json(Device::with('profile')->get(), 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar datos enviados por React
        $validatedData = $request->validate([
            'profile_id' => 'required|exists:profiles,id',
            'nfc_uid' => 'required|string|unique:devices,nfc_uid',
            'tipo' => 'required|string',
            'marca' => 'nullable|string',
            'modelo' => 'nullable|string',
            'color' => 'nullable|string',
            'numero_serie' => 'nullable|string'
        ]);

        // Crear dispositivo en la Base de Datos
        $device = Device::create($validatedData);

        return response()->json([
            'message' => 'Dispositivo registrado correctamente.',
            'device' => $device
        ], 201);
    }

    /**
     * Buscar dispositivo leyendo su etiqueta NFC en Portería.
     */
    public function showByNfc($nfc_uid)
    {
        $device = Device::with('profile')->where('nfc_uid', $nfc_uid)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Etiqueta NFC no registrada en el sistema.'
            ], 404);
        }

        if ($device->estado === 'Extraviado' || $device->estado === 'Retenido en CIC') {
            return response()->json([
                'status' => 'warning',
                'message' => 'Este dispositivo está reportado como: ' . $device->estado,
                'device' => $device
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'device' => $device
        ], 200);
    }
}
