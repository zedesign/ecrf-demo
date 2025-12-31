<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Affiche la liste des rôles avec leurs permissions.
     */
    public function index() {
        return Inertia::render('admin/settings/index', [
            'roles' => Role::with('permissions')->get(),
            'allPermissions' => Permission::all(),
            'currentTab' => 'roles'
        ]);
    }

    /**
     * Crée un nouveau rôle (Name + Slug).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', // Le nom d'affichage
            'slug' => 'required|string|max:255|unique:roles,name', // Le code technique
        ]);

        // Pour Spatie, la colonne 'name' est le slug technique
        Role::create([
            'name' => $validated['slug'],
            'display_name' => $validated['name'], // Note: Assure-toi d'avoir cette colonne en base
            'guard_name' => 'web'
        ]);

        return back()->with('message', 'Rôle créé avec succès.');
    }

    /**
     * Met à jour un rôle existant.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // On ne modifie généralement pas le slug car il est lié aux permissions en code
        $role->update([
            'display_name' => $validated['name']
        ]);

        return back()->with('message', 'Rôle mis à jour avec succès.');
    }

    /**
     * Met à jour les permissions eCRF d'un rôle.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
        ]);

        $role->syncPermissions($validated['permissions']);

        return back()->with('message', 'Droits d\'accès mis à jour.');
    }

    public function destroy(Role $role)
    {
        // Sécurité : on ne supprime pas le rôle admin
        if ($role->name === 'admin') {
            return back()->with('error', 'Le rôle administrateur ne peut pas être supprimé.');
        }

        $role->delete();
        return back()->with('message', 'Rôle supprimé.');
    }
}