<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyAudit extends Model
{
    protected $fillable = [
        'study_id',
        'user_id',
        'field_name',
        'old_value',
        'new_value',
        'reason'
    ];

    // Pour récupérer l'utilisateur qui a fait la modif
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Pour l'étude concernée
    public function study(): BelongsTo
    {
        return $this->belongsTo(Study::class);
    }
}