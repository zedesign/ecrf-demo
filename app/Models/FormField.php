<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 
        'section_id', 
        'name', 
        'label', 
        'field_type', 
        'placeholder', 
        'help_text', 
        'help_image', 
        'is_required', 
        'order', 
        'order_index', 
        'settings'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_required' => 'boolean',
        'order' => 'float',
        'order_index' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(FormSection::class, 'section_id');
    }
}