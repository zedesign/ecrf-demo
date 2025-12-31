<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSection;
use App\Models\FormField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FormBuilderController extends Controller
{
    /**
     * Liste des formulaires
     */
    public function index()
    {
        return Inertia::render('Builder/Index', [
            'forms' => Form::with('study')->orderBy('created_at', 'desc')->get()
        ]);
    }

    /**
     * Edition du formulaire (Chargement des données)
     */
/**
     * Edition du formulaire (Chargement des données triées)
     */
    public function edit(Form $form)
    {
        // On charge les relations en forçant le tri
        $form->load([
            'sections' => function($query) {
                $query->orderBy('order_index', 'asc');
            },
            'sections.fields' => function($query) {
                $query->orderBy('order', 'asc');
            },
            'study'
        ]);

        return Inertia::render('Builder/Editor', [ 
            'form' => $form,
            'study' => $form->study,
            'studyForms' => Form::where('study_id', $form->study_id)->with('sections')->get()
        ]);
    }

    

    /**
     * Création initiale
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'study_id' => 'required|exists:studies,id',
        ]);
        
        $form = Form::create($validated);
        return redirect()->route('builder.forms.edit', $form->id);
    }

    /**
     * SAUVEGARDE ET SYNCHRONISATION PARFAITE
     */
    public function update(Request $request, Form $form)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'sections' => 'required|array',
        ]);

        try {
            DB::transaction(function () use ($form, $request) {
                // 1. Mise à jour du titre du formulaire
                $form->update(['title' => $request->title]);

                $activeSectionIds = [];
                $activeFieldIds = [];

                foreach ($request->sections as $sectionData) {
                    // 2. Synchronisation de la Section
                    // Si l'ID n'existe pas ou est temporaire, updateOrCreate gère la création
                    $section = FormSection::updateOrCreate(
                        ['id' => $sectionData['id']],
                        [
                            'form_id' => $form->id,
                            'title' => $sectionData['title'],
                            'order_index' => $sectionData['order'] ?? 0
                        ]
                    );
                    
                    $activeSectionIds[] = $section->id;

                    if (isset($sectionData['fields']) && is_array($sectionData['fields'])) {
                        foreach ($sectionData['fields'] as $fieldData) {
                            
                            // Formatage du nom de la variable (Uppercase + Underscore)
                            $varName = strtoupper(str_replace(' ', '_', trim($fieldData['name'])));

                            // 3. Synchronisation du Champ (Field)
                            // On se base sur l'ID envoyé par React
                            $field = FormField::updateOrCreate(
                                ['id' => $fieldData['id']],
                                [
                                    'section_id'  => $section->id,
                                    'name'        => $varName,
                                    'label'       => $fieldData['label'] ?? '',
                                    'field_type'  => $fieldData['field_type'] ?? 'text',
                                    'placeholder' => $fieldData['settings']['placeholder'] ?? null,
                                    'help_text'   => $fieldData['settings']['description'] ?? null,
                                    'help_image'  => $fieldData['settings']['helpImageUrl'] ?? null,
                                    'is_required' => (bool)($fieldData['is_required'] ?? false),
                                    'order'       => $fieldData['order'],
                                    'order_index' => (int)$fieldData['order'],
                                    'settings'    => $fieldData['settings'] ?? []
                                ]
                            );

                            $activeFieldIds[] = $field->id;
                        }
                    }
                }

                // --- NETTOYAGE DES DONNÉES SUPPRIMÉES DANS L'UI ---

                // 4. On supprime les champs qui ne sont plus présents dans le payload
                // On cible les champs des sections qui appartiennent à ce formulaire
                FormField::whereIn('section_id', $activeSectionIds)
                         ->whereNotIn('id', $activeFieldIds)
                         ->delete();

                // 5. On supprime les sections qui ont été retirées
                FormSection::where('form_id', $form->id)
                           ->whereNotIn('id', $activeSectionIds)
                           ->delete();
            });

            return back()->with('message', 'Synchronisation terminée : tout est à jour.');

        } catch (\Exception $e) {
            // En cas de crash (ex: erreur SQL), on annule tout
            return back()->withErrors(['error' => 'Erreur de synchronisation : ' . $e->getMessage()]);
        }
    }

    /**
     * Suppression complète d'un formulaire
     */
    public function destroy(Form $form)
    {
        $form->delete();
        return redirect()->route('builder.forms.index');
    }
    
}