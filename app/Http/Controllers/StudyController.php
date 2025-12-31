<?php

namespace App\Http\Controllers;

use App\Models\Study;
use App\Models\User;
use App\Models\Center;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller; 

class StudyController extends Controller
{
    /**
     * Liste des études (Page /studies)
     */
    public function index()
    {
        // On ajoute 'auditLogs.user' pour avoir l'historique ET le nom de celui qui a modifié
        $studies = Study::with(['centers', 'auditLogs.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('dashboard', [
            'studies' => $studies,
            'users'   => User::with('roles')->get(), 
            'centers' => Center::all(),
        ]);
    }

    /**
     * Détails d'une étude
     */
    public function show(Study $study)
    {
        $study->load(['centers', 'sponsor', 'forms' => function($query) {
            $query->orderBy('order_index', 'asc');
        }]);

        return Inertia::render('studies/show', [
            'study' => $study
        ]);
    }

    /**
     * Enregistre une nouvelle étude
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'protocol_code' => 'required|string|unique:studies',
            'protocol_version' => 'required|string',
            'protocol_date' => 'required|date',
            'start_date' => 'required|date|after_or_equal:today',
            'phase' => 'required|string',
            'target_inclusions' => 'required|integer|min:0',
            'therapeutic_area' => 'nullable|string',
            'sponsor_id' => 'required|exists:users,id',
            'selected_centers' => 'nullable|array'
        ]);

        $study = Study::create($validated);
        
        if ($request->has('selected_centers')) {
            $study->centers()->sync($request->selected_centers);
        }

        return redirect()->back()->with('success', 'Étude créée avec succès.');
    }

    /**
     * Met à jour une étude
     */
    public function update(Request $request, $id)
    {
        $study = Study::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'protocol_version' => 'required|string',
            'protocol_date' => 'required|date',
            'start_date' => 'required|date',
            'status' => 'required|string',
            'phase' => 'required|string',
            'therapeutic_area' => 'required|string',
            'target_inclusions' => 'required|integer|min:0',
            'sponsor_id' => 'required|exists:users,id',
            'selected_centers' => 'nullable|array',
            'edit_reason' => 'required|string|min:5',
        ]);

        $oldValues = $study->getRawOriginal();
        
        // --- 1. LOGIQUE POUR LES CENTRES ---
        if ($request->has('selected_centers')) {
            $oldCenters = $study->centers->pluck('id')->toArray();
            $newCenters = $request->selected_centers;

            if (count(array_diff($oldCenters, $newCenters)) > 0 || count(array_diff($newCenters, $oldCenters)) > 0) {
                $study->auditLogs()->create([
                    'user_id'    => auth()->id(),
                    'field_name' => 'centers',
                    'old_value'  => implode(', ', $study->centers->pluck('name')->toArray()) ?: 'Aucun centre',
                    'new_value'  => implode(', ', Center::whereIn('id', $newCenters)->pluck('name')->toArray()),
                    'reason'     => $request->edit_reason,
                ]);
            }
            $study->centers()->sync($newCenters);
        }

        // --- 2. LOGIQUE POUR LES CHAMPS CLASSIQUES ---
        $study->update($validated);
        $changes = $study->getChanges();

        foreach ($changes as $field => $newValue) {
            // ON AJOUTE 'protocol_version' À LA LISTE DES EXCLUSIONS ICI :
            if (in_array($field, ['updated_at', 'id', 'edit_reason', 'protocol_version'])) {
                continue;
            }

            $study->auditLogs()->create([
                'user_id'    => auth()->id(),
                'field_name' => $field,
                'old_value'  => $oldValues[$field] ?? 'Vide',
                'new_value'  => $newValue,
                'reason'     => $request->edit_reason,
            ]);
        }

        return redirect()->back()->with('success', 'Mise à jour réussie');
    }
}