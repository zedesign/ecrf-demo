<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;

// Import des contrôleurs
use App\Http\Controllers\Settings\UserController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\AuditController;
use App\Http\Controllers\Settings\CenterController;
use App\Http\Controllers\StudyController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Study\CRFBuilderController; 
use App\Models\User;

/*
|--------------------------------------------------------------------------
| 1. ROUTES PUBLIQUES
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('auth/login', [
        'canRegister' => Features::enabled(Features::registration()),
        'canResetPassword' => Route::has('password.request'),
    ]);
})->name('home');

Route::post('/check-user-password-status', function (Request $request) {
    $email = $request->input('email'); 
    if (!$email) return response()->json(['must_create_password' => false]);
    $user = User::where('email', $email)->first();
    return response()->json([
        'must_create_password' => $user ? (bool)$user->must_create_password : false
    ]);
});

Route::post('/initial-setup', [NewPasswordController::class, 'storeInitial'])->name('password.initial-setup');

/*
|--------------------------------------------------------------------------
| 2. ROUTES PROTÉGÉES (Auth & Verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD PRINCIPAL (Liste des études) ---
    Route::get('studies', [StudyController::class, 'index'])->name('dashboard');

    Route::get('dashboard', function () {
        return redirect()->route('dashboard');
    });

    /*
    |--------------------------------------------------------------------------
    | 3. GESTION DES ÉTUDES & CRF BUILDER
    |--------------------------------------------------------------------------
    */
    Route::prefix('studies')->name('studies.')->group(function () {
        
        Route::post('/', [StudyController::class, 'store'])->name('store');
        
        // Note: Ici on précise :protocol_code pour que l'URL soit /studies/SEP-ALG-01
        Route::get('/{study:protocol_code}', [StudyController::class, 'show'])->name('show');
        Route::put('/{study:protocol_code}', [StudyController::class, 'update'])->name('update');

        // Sous-groupe pour une étude spécifique via son protocol_code
        Route::prefix('{study:protocol_code}')->group(function () {
            
            Route::get('/ecrf-dashboard', function () {
                return Inertia::render('Study/ECRF/Dashboard');
            })->name('ecrf.dashboard');

            // --- ROUTES DU BUILDER ---
            Route::get('/builder', [CRFBuilderController::class, 'index'])->name('builder');
            
            // LA CORRECTION EST ICI : On définit la route POST
            Route::post('/crf-builder/structure', [CRFBuilderController::class, 'storeStructure'])
                ->name('crf-builder.store');

            Route::get('/inclusions', function () {
                return Inertia::render('Study/ECRF/Inclusions');
            })->name('inclusions');

            Route::get('/monitoring', function () {
                return Inertia::render('Study/ECRF/Monitoring');
            })->name('monitoring');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | 4. GESTION DES FORMULAIRES & ÉDITION (Editor)
    |--------------------------------------------------------------------------
    */
    Route::prefix('forms')->name('forms.')->group(function () {
        Route::get('/{form}/edit', [CRFBuilderController::class, 'edit'])->name('edit');
        Route::delete('/{form}', [CRFBuilderController::class, 'destroyForm'])->name('destroy');
        Route::post('/{form}/sections', [CRFBuilderController::class, 'storeSection'])->name('sections.store');
        Route::post('/{form}/sections/reorder-simple', [CRFBuilderController::class, 'updateSectionsOrder'])->name('sections.reorder-simple');
        Route::patch('/{form}/sections/reorder', [CRFBuilderController::class, 'reorderSections'])->name('sections.reorder');
    });

    Route::prefix('sections')->name('sections.')->group(function () {
        Route::post('/{section}/fields', [CRFBuilderController::class, 'storeField'])->name('fields.store');
        Route::delete('/{section}', [CRFBuilderController::class, 'destroySection'])->name('destroy');
    });

    Route::prefix('fields')->name('fields.')->group(function () {
        Route::patch('/{field}', [CRFBuilderController::class, 'updateField'])->name('update');
        Route::delete('/{field}', [CRFBuilderController::class, 'destroyField'])->name('destroy');
        Route::patch('/{section}/reorder', [CRFBuilderController::class, 'reorderFields'])->name('reorder');
    });

    /*
    |--------------------------------------------------------------------------
    | 5. ADMINISTRATION & PARAMÈTRES
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::prefix('settings')->name('admin.settings.')->group(function () {
            Route::controller(UserController::class)->group(function () {
                Route::get('/users', 'index')->name('users.index');
                Route::post('/users', 'store')->name('users.store');
                Route::put('/users/{user}', 'update')->name('users.update');
                Route::delete('/users/{user}', 'destroy')->name('users.destroy');
                Route::get('/centers-tab', 'index')->name('centers'); 
            });

            Route::controller(RoleController::class)->group(function () {
                Route::get('/roles', 'index')->name('roles.index');
                Route::post('/roles', 'store')->name('roles.store');
                Route::put('/roles/{role}', 'update')->name('roles.update');
                Route::delete('/roles/{role}', 'destroy')->name('roles.destroy');
                Route::post('/roles/{role}/permissions', 'updatePermissions')->name('roles.permissions');
            });

            Route::controller(CenterController::class)->group(function () {
                Route::get('/centers', 'index')->name('centers');
                Route::post('/centers', 'store')->name('centers.store');
            });

            Route::get('/audits', [AuditController::class, 'index'])->name('audits.index');
        });

        Route::prefix('centers')->name('centers.')->group(function () {
            Route::controller(CenterController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::post('/{center}/update', 'update')->name('update');
                Route::post('/{center}/toggle', 'toggle')->name('toggle');
                Route::delete('/{center}', 'destroy')->name('destroy');
            });
        });
    });
});

if (file_exists(__DIR__.'/settings.php')) {
    require __DIR__.'/settings.php';
}