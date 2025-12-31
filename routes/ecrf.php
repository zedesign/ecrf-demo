<?php

use App\Http\Controllers\FormBuilderController;
use Illuminate\Support\Facades\Route;

// On s'assure que le middleware auth est présent
Route::middleware(['auth'])->group(function () {

    // --- GESTION DES FORMULAIRES ---
    Route::get('/forms', [FormBuilderController::class, 'index'])->name('forms.index');
    Route::post('/forms', [FormBuilderController::class, 'store'])->name('forms.store');
    Route::get('/forms/{form}/edit', [FormBuilderController::class, 'edit'])->name('forms.edit');
    
    // Cette ligne est cruciale pour votre bouton "Enregistrer"
    Route::put('/forms/{form}', [FormBuilderController::class, 'update'])->name('forms.update');
    
    Route::delete('/forms/{form}', [FormBuilderController::class, 'destroy'])->name('forms.destroy');

    // --- GESTION DES SECTIONS ---
    Route::post('/forms/{form}/sections', [FormBuilderController::class, 'storeSection'])->name('sections.store');
    Route::patch('/forms/{form}/sections/reorder', [FormBuilderController::class, 'reorderSections'])->name('sections.reorder');
    Route::delete('/sections/{section}', [FormBuilderController::class, 'destroySection'])->name('sections.destroy');

    // --- GESTION DES FIELDS ---
    Route::post('/sections/{section}/fields', [FormBuilderController::class, 'storeField'])->name('fields.store');
    Route::patch('/fields/{field}', [FormBuilderController::class, 'updateField'])->name('fields.update');
    Route::patch('/sections/{section}/fields/reorder', [FormBuilderController::class, 'reorderFields'])->name('fields.reorder');
    Route::delete('/fields/{field}', [FormBuilderController::class, 'destroyField'])->name('fields.destroy');
});