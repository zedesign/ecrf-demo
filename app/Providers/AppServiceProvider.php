<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event; // Import requis
use Illuminate\Auth\Events\Login;    // Import requis

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Écouter l'événement de connexion pour mettre à jour la date
        Event::listen(Login::class, function ($event) {
            $event->user->update([
                'last_login_at' => now(),
            ]);
        });
    }
}