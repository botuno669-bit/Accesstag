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

    /**
     * Actualizar estado del dispositivo (Activo, Bloqueado, Extraviado)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'estado' => 'required|string|in:Activo,Bloqueado,Extraviado,Retenido en CIC'
        ]);

        $device = Device::findOrFail($id);
        $device->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado actualizado exitosamente.',
            'device' => $device
        ], 200);
    }

    /**
     * Vincular nuevo NFC físico al dispositivo (El administrador pega el sticker y lo registra)
     */
    public function linkNfc(Request $request, $id)
    {
        $request->validate([
            'nfc_uid' => 'required|string|unique:devices,nfc_uid'
        ]);

        $device = Device::findOrFail($id);
        
        // Verificamos que sea un dispositivo pendiente de vinculación
        if (!str_starts_with($device->nfc_uid, 'TEMP-')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Este dispositivo ya tiene un chip NFC físico vinculado.'
            ], 400);
        }

        $device->update(['nfc_uid' => $request->nfc_uid]);

        return response()->json([
            'message' => 'Etiqueta NFC vinculada correctamente. Dispositivo listo para usar.',
            'device' => $device
        ], 200);
    }

    /**
     * Subir y actualizar la foto del dispositivo
     */
    public function updatePhoto(Request $request, $id)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        $device = Device::findOrFail($id);

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_device_' . $device->id . '.' . $file->getClientOriginalExtension();
            
            // Guardar en storage/app/public/devices
            $path = $file->storeAs('devices', $filename, 'public');
            
            // Actualizar DB con la ruta
            $device->update(['foto_url' => '/storage/' . $path]);

            return response()->json([
                'message' => 'Foto del dispositivo actualizada exitosamente.',
                'foto_url' => '/storage/' . $path
            ], 200);
        }

        return response()->json(['error' => 'No se recibió ninguna imagen.'], 400);
    }
}
