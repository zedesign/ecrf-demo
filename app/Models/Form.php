<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Form extends Model
{
    use HasUuids;

    protected $fillable = [
        'study_id', 
        'title', 
        'description', 
        'version', 
        'status', 
        'order',
        'is_hidden'
    ];

    public function study(): BelongsTo
    {
        return $this->belongsTo(Study::class);
    }

    public function sections(): HasMany
    {
        // On trie par order
        return $this->hasMany(FormSection::class)->orderBy('order', 'asc');
    }

    public function fields(): HasManyThrough
    {
        return $this->hasManyThrough(
            FormField::class,
            FormSection::class,
            'form_id',
            'section_id',
            'id',
            'id'
        );
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}