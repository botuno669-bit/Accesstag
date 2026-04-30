<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Traer datos de perfil del usuario
     */
    public function show($supabase_user_id)
    {
        $profile = Profile::where('supabase_user_id', $supabase_user_id)->first();
        if(!$profile) return response()->json(['error' => 'Perfil no encontrado'], 404);
        
        return response()->json($profile, 200);
    }

    /**
     * Guardar el perfil después de que se registran en Supabase
     */
    public function store(Request $request)
    {
        $request->validate([
            'supabase_user_id' => 'required|string|unique:profiles,supabase_user_id',
            'nombre_completo' => 'required|string',
            'tipo_documento' => 'required|string',
            'numero_documento' => 'required|string|unique:profiles,numero_documento',
        ]);

        // Por defecto, nacen como Aprendiz No Validado
        $profile = Profile::create([
            'supabase_user_id' => $request->supabase_user_id,
            'nombre_completo' => $request->nombre_completo,
            'tipo_documento' => $request->tipo_documento,
            'numero_documento' => $request->numero_documento,
            'rol' => 'Aprendiz (No Validado)'
        ]);

        return response()->json([
            'mensaje' => 'Perfil creado. Acércate a portería para verificación.',
            'perfil' => $profile
        ], 201);
    }

    /**
     * Traer TODOS los perfiles (Para el Panel de Administración)
     */
    public function index()
    {
        $profiles = Profile::all();
        return response()->json($profiles, 200);
    }

    /**
     * Actualizar Rol del Usuario (Ascender a Guarda o Validar Aprendiz)
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'rol' => 'required|string|in:Administrador,Guarda,Aprendiz,Aprendiz (No Validado),Bloqueado'
        ]);

        $profile = Profile::findOrFail($id);
        $profile->update(['rol' => $request->rol]);

        return response()->json(['mensaje' => 'Rol actualizado exitosamente', 'perfil' => $profile], 200);
    }
}
