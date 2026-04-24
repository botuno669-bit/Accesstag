<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'profile_id',
        'nfc_uid',
        'tipo',
        'marca',
        'modelo',
        'color',
        'numero_serie',
        'estado'
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }
}
