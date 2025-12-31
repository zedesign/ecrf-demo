<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Center;
use Inertia\Inertia; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Affiche la liste des utilisateurs, rôles et centres.
     */
    public function index(Request $request) {
        $path = $request->getPathInfo();
        
        // Détection de l'onglet actif
        if (str_contains($path, 'centers')) {
            $currentTab = 'centers';
        } elseif (str_contains($path, 'roles')) {
            $currentTab = 'roles';
        } else {
            $currentTab = 'users';
        }

        return Inertia::render('admin/settings/index', [
            'users' => User::with(['roles', 'center'])->latest()->get(),
            'roles' => Role::with('permissions')->get(), 
            'centers' => Center::all(),
            'currentTab' => $currentTab
        ]);
    }

    /**
     * Crée un nouveau rôle (appelé par RoleForm.tsx).
     */
    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web'
        ]);

        return back()->with('message', 'Rôle créé avec succès.');
    }

    /**
     * Crée un nouvel utilisateur.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|string',
            'center_id' => 'required|exists:centers,id',
            'must_create_password' => 'required|boolean',
            'password' => 'required_if:must_create_password,false|nullable|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'center_id' => $validated['center_id'],
            'must_create_password' => $validated['must_create_password'],
            'password' => $validated['must_create_password'] 
                ? Hash::make(Str::random(16)) 
                : Hash::make($validated['password']),
        ]);

        if ($request->has('role')) {
            $user->assignRole($request->role); 
        }

        return back()->with('message', 'Utilisateur créé avec succès.');
    }

    /**
     * Met à jour un utilisateur.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'center_id' => 'required',
            'password'  => ['nullable', 'min:8'],
            'role'      => 'nullable|string',
            'must_create_password' => 'boolean'
        ]);

        $user->update([
            'name'                 => $validated['name'],
            'email'                => $validated['email'],
            'center_id'            => $validated['center_id'],
            'must_create_password' => $request->must_create_password,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        if ($request->filled('role')) {
            $user->syncRoles([$request->role]);
        }

        return back()->with('message', 'Utilisateur mis à jour avec succès.');
    }

    /**
     * Supprime un utilisateur.
     */
    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();
        return back()->with('message', 'Utilisateur supprimé.');
    }
}