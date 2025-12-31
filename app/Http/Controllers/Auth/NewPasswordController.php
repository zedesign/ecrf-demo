<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class NewPasswordController extends Controller
{
    public function storeInitial(Request $request)
    {
        // 1. Validation des données
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // 2. Récupération de l'utilisateur
        $user = User::where('email', $request->email)->first();

        // 3. Mise à jour du mot de passe et du statut
        $user->forceFill([
            'password' => Hash::make($request->password),
            'must_create_password' => false, // On désactive le flag
        ])->save();

        // 4. Connexion automatique de l'utilisateur
        Auth::login($user);

        // 5. Redirection vers le dashboard
        return redirect()->route('dashboard');
    }
}