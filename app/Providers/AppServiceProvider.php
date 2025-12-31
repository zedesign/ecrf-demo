<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL; // Import indispensable pour le HTTPS
use Illuminate\Auth\Events\Login;

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
        /**
         * 1. Correction Erreur Mixed Content (Railway)
         * Force Laravel à générer des URLs en https:// au lieu de http://
         * Cela permet de charger correctement ton CSS et ton React sur Railway.
         */
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        /**
         * 2. Gestion du dernier login
         * Écouter l'événement de connexion pour mettre à jour la date
         */
        Event::listen(Login::class, function ($event) {
            $event->user->update([
                'last_login_at' => now(),
            ]);
        });
    }
}