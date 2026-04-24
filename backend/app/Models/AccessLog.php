<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    protected $fillable = [
        'device_id',
        'guarda_id',
        'tipo_movimiento',
        'observacion'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'guarda_id');
    }
}
