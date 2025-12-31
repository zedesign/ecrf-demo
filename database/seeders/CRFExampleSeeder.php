<?php

namespace Database\Seeders;

use App\Models\Form;
use App\Models\FormSection;
use App\Models\Study;
use Illuminate\Database\Seeder;

class CRFExampleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. On récupère ou on crée une étude (ID BigInt)
        $study = Study::first() ?? Study::create([
            'name' => 'Étude Clinique Alpha',
            'description' => 'Protocole de test pour le builder eCRF',
        ]);

        // 2. Création du Formulaire (ID UUID) lié à l'étude
        $form = Form::create([
            'study_id' => $study->id,
            'title' => 'Visite d\'Inclusion (V0)',
            'description' => 'Premier contact et critères d\'éligibilité',
            'status' => 'published',
            'version' => 1,
            'order_index' => 1
        ]);

        // 3. Section 1 : Démographie
        $demoSection = $form->sections()->create([
            'title' => 'Données Démographiques',
            'description' => 'Informations de base du patient',
            'order_index' => 0
        ]);

        // Ajout de questions dans la section 1
        $demoSection->fields()->createMany([
            [
                'label' => 'Âge du patient',
                'field_type' => 'number',
                'is_required' => true,
                'order_index' => 0,
                'settings' => ['min' => 18, 'max' => 95, 'unit' => 'ans']
            ],
            [
                'label' => 'Sexe',
                'field_type' => 'radio',
                'is_required' => true,
                'order_index' => 1,
                'settings' => [
                    'options' => [
                        ['label' => 'Homme', 'value' => 'M'],
                        ['label' => 'Femme', 'value' => 'F']
                    ]
                ]
            ]
        ]);

        // 4. Section 2 : Examen Physique
        $physSection = $form->sections()->create([
            'title' => 'Examen Physique',
            'order_index' => 1
        ]);

        $physSection->fields()->create([
            'label' => 'Le patient présente-t-il des antécédents cardiaques ?',
            'field_type' => 'select',
            'is_required' => false,
            'order_index' => 0,
            'settings' => [
                'options' => [
                    ['label' => 'Oui', 'value' => 'yes'],
                    ['label' => 'Non', 'value' => 'no'],
                    ['label' => 'Inconnu', 'value' => 'unknown']
                ],
                'logic' => [
                    'show_warning_if' => 'yes',
                    'message' => 'Veuillez remplir le formulaire de complications.'
                ]
            ]
        ]);

        $this->command->info('✅ eCRF de test généré avec succès pour l\'étude : ' . $study->name);
    }
}