<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Center;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CenterController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/settings/index', [
            // On s'assure de récupérer le status pour le front-end
            'centers' => Center::latest()->get(),
            'users'   => User::all(),
            'roles'   => Role::all(),
            'audits'  => [], 
            'currentTab' => 'centers'
        ]);
    }

    public function store(Request $request)
    {
    $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:centers,code',
            'wilaya' => 'required|string',
            'structure_type' => 'required|string',
            'service_name' => 'required|string|max:255',
            'head_of_service' => 'required|string',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
        ]);

        // Par défaut, un nouveau centre est actif
        $validated['status'] = 'active';

        Center::create($validated);

        return redirect()->back()->with('success', 'Centre créé avec succès');
    }

    /**
     * Alterne entre 'active' et 'inactive'
     */
    public function toggle(Center $center)
    {
        if ($center->status === 'active') {
            $center->status = 'inactive';
            $center->is_active = false;
        } else {
            $center->status = 'active';
            $center->is_active = true;
        }

        $center->save();

        return redirect()->back()->with('success', 'Statut mis à jour avec succès');
    }

    /**
     * Supprime définitivement le centre
     */
    public function destroy(Center $center)
    {
        $center->delete();

        return redirect()->back()->with('success', 'Centre supprimé définitivement.');
    }

    public function update(Request $request, $id)
    {
        // 1. Trouver le centre
        $center = Center::findOrFail($id);

        // 2. Valider les données
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'code'            => 'required|string|unique:centers,code,' . $center->id,
            'wilaya'          => 'required|string',
            'structure_type'  => 'required|string',
            'service_name'    => 'nullable|string',
            'head_of_service' => 'nullable|string',
            'phone'           => 'nullable|string',
            'email'           => 'nullable|email',
        ]);

        // 3. Mettre à jour
        $center->update($validated);

        // 4. Retourner vers la vue avec un message de succès
        return back()->with('message', 'Le centre a été mis à jour avec succès.');
    }
}