<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Center extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'code', 
        'wilaya', 
        'service_name', 
        'head_of_service', 
        'phone', 
        'email', 
        'structure_type', 
        'is_active',
        'status'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}