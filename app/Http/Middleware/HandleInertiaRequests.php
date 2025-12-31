<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Study;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        
        // --- LOGIQUE STUDY ACTIVE ---
        $routeParam = $request->route('study');
        $activeStudy = null;

        if ($user) {
            if ($routeParam instanceof Study) {
                $activeStudy = $routeParam;
            } elseif (is_string($routeParam)) {
                $activeStudy = Study::where('protocol_code', $routeParam)->first();
            }

            if (!$activeStudy) {
                // Utilisation de find sans select pour éviter l'ambiguïté au chargement initial
                $activeStudy = Study::find($user->last_study_id) ?? $user->studies()->first();
            }

            if ($activeStudy && (int)$user->last_study_id !== (int)$activeStudy->id) {
                $user->update(['last_study_id' => $activeStudy->id]);
            }
        }

        // --- COLLECTION DES ÉTUDES (CORRIGÉ POUR POSTGRES) ---
        $allStudies = [];
        if ($user) {
            $query = $user->hasRole('super_admin') ? Study::query() : $user->studies();
            
            // On préfixe impérativement par "studies." pour PostgreSQL
            $allStudies = $query->select([
                    'studies.id', 
                    'studies.name', 
                    'studies.protocol_code', 
                    'studies.protocol_version', 
                    'studies.phase', 
                    'studies.status'
                ])
                ->orderBy('studies.protocol_code')
                ->get()
                ->toArray(); // Conversion directe en tableau simple
        }

        return [
            ...parent::share($request),
            
            'flash' => [
                'message' => $request->session()->get('success') ?? $request->session()->get('message'),
                'error'   => $request->session()->get('error'),
            ],

            'activeStudy' => $activeStudy ? $activeStudy->toArray() : null,
            'allStudies'  => $allStudies,
            
            'auth' => [
                'user' => $user ? [
                    'id'   => $user->id,
                    'name' => $user->name,
                    'role' => $user->getRoleNames()->first(), 
                ] : null,
            ],
            'ziggy' => ['location' => $request->url()],
        ];
    }
}