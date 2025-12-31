<?php

namespace App\Http\Controllers\Study;

use App\Http\Controllers\Controller;
use App\Models\Study;
use App\Models\Form;
use App\Models\FormSection;
use App\Models\FormField;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CRFBuilderController extends Controller
{
    /**
     * Affiche le Builder (Vue d'ensemble / Planification)
     */
    public function index(Study $study)
    {
        return Inertia::render('Builder/Builder', [
            'study' => $study,
            'forms' => Form::where('study_id', $study->id)
                ->with(['sections' => function($q) {
                    $q->orderBy('order', 'asc');
                }])
                ->withCount('sections')
                ->orderBy('order', 'asc')
                ->get()
        ]);
    }

    /**
     * Ouvre l'éditeur pour un formulaire spécifique (Contenu des questions)
     */
    public function edit(Form $form)
    {
        // On charge les relations pour que l'éditeur ait les sections et les champs
        $form->load(['sections.fields', 'study']);

        return Inertia::render('Builder/Editor', [
            'study' => $form->study,
            'form' => $form
        ]);
    }

    /**
     * Sauvegarde la structure globale (Action du bouton "Enregistrer la structure")
     */
public function storeStructure(Request $request, Study $study)
{
    $visits = $request->input('visits');

    DB::transaction(function () use ($visits, $study) {
        // 1. Filtrage strict des IDs de formulaires pour PostgreSQL
        // On ne garde que les vrais UUID (exclut 'v1', 'temp-', etc.)
        $incomingFormIds = collect($visits)
            ->map(fn($v) => (string)$v['id'])
            ->filter(function($id) {
                return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id);
            })
            ->toArray();

        // 2. Supprimer les formulaires obsolètes sans crash de type
        Form::where('study_id', $study->id)
            ->whereNotIn('id', $incomingFormIds)
            ->delete();

        foreach ($visits as $visitData) {
            // Vérification si l'ID actuel est un UUID valide ou un ID temporaire du front
            $currentId = (string)$visitData['id'];
            $isValidUuid = preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $currentId);
            
            $id = $isValidUuid ? $currentId : null;

            $form = Form::updateOrCreate(
                ['id' => $id, 'study_id' => $study->id],
                [
                    'title' => $visitData['title'],
                    'order' => $visitData['order'],
                    'is_hidden' => $visitData['isHidden'] ?? false,
                ]
            );

            if (isset($visitData['subsections'])) {
                // Même filtrage strict pour les IDs de sections (UUID)
                $incomingSectionIds = collect($visitData['subsections'])
                    ->map(fn($s) => (string)$s['id'])
                    ->filter(function($sid) {
                        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $sid);
                    })
                    ->toArray();

                FormSection::where('form_id', $form->id)
                    ->whereNotIn('id', $incomingSectionIds)
                    ->delete();

                foreach ($visitData['subsections'] as $sectionData) {
                    $sCurrentId = (string)$sectionData['id'];
                    $isSValidUuid = preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $sCurrentId);
                    
                    $sId = $isSValidUuid ? $sCurrentId : null;

                    FormSection::updateOrCreate(
                        ['id' => $sId, 'form_id' => $form->id],
                        [
                            'title' => $sectionData['title'],
                            'order' => $sectionData['order']
                        ]
                    );
                }
            }
        }
    });

    return redirect()->back()->with('success', 'Structure mise à jour avec succès');
}

    // --- Méthodes pour l'Éditeur ---

    public function storeSection(Request $request, Form $form) 
    {
        $form->sections()->create([
            'title' => $request->title ?? 'Nouvelle Section',
            'order' => $form->sections()->count()
        ]);
        return redirect()->back();
    }

    public function storeField(Request $request, FormSection $section) 
    {
        $section->fields()->create([
            'label' => $request->label ?? 'Nouvelle Question',
            'type' => $request->type ?? 'text',
            'order' => $section->fields()->count(),
            'settings' => $request->settings ?? []
        ]);
        return redirect()->back();
    }

    public function updateField(Request $request, $fieldId) 
    {
        $field = FormField::findOrFail($fieldId);
        $field->update($request->all());
        return redirect()->back();
    }

    public function destroyForm(Form $form)
    {
        $form->delete();
        return redirect()->back();
    }

    public function destroySection(FormSection $section)
    {
        $section->delete();
        return redirect()->back();
    }

    public function destroyField($fieldId)
    {
        FormField::destroy($fieldId);
        return redirect()->back();
    }
    
    public function updateSectionsOrder(Request $request, $formId)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required',
            'sections.*.title' => 'required|string',
            'sections.*.order' => 'required|integer',
        ]);

        foreach ($request->sections as $sectionData) {
            // On utilise updateOrCreate pour gérer aussi les nouvelles sections
            \App\Models\FormSection::updateOrCreate(
                ['id' => str_contains($sectionData['id'], 'new') ? null : $sectionData['id']],
                [
                    'form_id' => $formId,
                    'title'   => $sectionData['title'],
                    'order'   => $sectionData['order'],
                ]
            );
        }

        // Optionnel : Supprimer les sections qui ne sont plus dans le tableau (si tu as géré la suppression)
        // $sectionIds = collect($request->sections)->pluck('id')->filter(fn($id) => !str_contains($id, 'new'));
        // \App\Models\FormSection::where('form_id', $formId)->whereNotIn('id', $sectionIds)->delete();

        return back()->with('success', 'Structure mise à jour avec succès');
    }
}