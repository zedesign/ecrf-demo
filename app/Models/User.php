<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // Import important

class User extends Authenticatable implements Auditable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, AuditableTrait;

    protected $fillable = [
        'name',
        'email',
        'password',
        'center_id',
        'must_create_password',
        'last_study_id',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'must_create_password' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * --- AJOUT DE LA RELATION STUDIES ---
     * Relie l'utilisateur aux études auxquelles il a accès.
     */
    public function studies(): BelongsToMany
    {
        // On utilise belongsToMany car un utilisateur peut travailler sur plusieurs études
        // et une étude a plusieurs utilisateurs (ARC, Investigateur, etc.)
        return $this->belongsToMany(Study::class);
    }

    /**
     * Récupère le centre hospitalier associé à l'utilisateur.
     */
    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function isOnline()
    {
        return $this->last_login_at && $this->last_login_at->diffInMinutes(now()) < 5;
    }

    protected $appends = ['is_online'];

    public function getIsOnlineAttribute()
    {
        return $this->isOnline();
    }
}