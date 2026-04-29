<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'supabase_user_id',
        'nombre_completo',
        'tipo_documento',
        'numero_documento',
        'rol'
    ];

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
