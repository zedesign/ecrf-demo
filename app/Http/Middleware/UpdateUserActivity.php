<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, $next)
    {
        if (auth()->check()) {
            // On met à jour sans toucher aux timestamps "updated_at" pour la performance
            auth()->user()->timestamps = false;
            auth()->user()->update(['last_login_at' => now()]);
        }
        return $next($request);
    }
}
