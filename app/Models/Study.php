<?php

namespace App\Models;

use App\Models\Form;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Study extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'protocol_code',
        'protocol_version',
        'protocol_date',
        'start_date',
        'phase',
        'status',
        'target_inclusions',
        'therapeutic_area',
        'description',
        'sponsor_id',
    ];

    protected $casts = [
        'protocol_date' => 'date',
        'start_date' => 'date',
        'target_inclusions' => 'integer',
    ];

    /**
     * ✅ Utiliser le protocol_code pour le Route Model Binding
     * Permet de trouver l'étude via /studies/ALGERIE-CAVUM au lieu de /studies/1
     */
    public function getRouteKeyName(): string
    {
        return 'protocol_code'; 
    }
    
    public function auditLogs()
    {
        return $this->hasMany(StudyAudit::class)
                    ->with('user') // Pour avoir le nom de l'utilisateur
                    ->latest();    // Plus récent en premier
    }

    /**
     * Relation avec les Centres
     */
    public function centers(): BelongsToMany
    {
        return $this->belongsToMany(Center::class, 'center_study');
    }

    /**
     * Relation avec le Sponsor
     */
    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    /**
     * Relation avec les Utilisateurs de l'étude
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'study_user')
                    ->withPivot('center_id')
                    ->withTimestamps();
    }
    public function forms(): HasMany
    {
        return $this->hasMany(Form::class);
    }
}