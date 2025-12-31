<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Study;
use App\Models\User;
use Carbon\Carbon;

class StudySeeder extends Seeder
{
    public function run(): void
    {
        // On récupère le premier utilisateur (Admin/Sponsor)
        $sponsor = User::first();

        if (!$sponsor) {
            $this->command->error("Aucun utilisateur trouvé. Lancez d'abord le UserSeeder.");
            return;
        }

        $studies = [
            [
                'name' => 'Évaluation du Cetuximab sur le carcinome du CAVUM',
                'protocol_code' => 'DZ-CAVUM-2025',
                'protocol_version' => '1.0',
                'phase' => 'Phase III',
                'status' => 'Active',
                'target_inclusions' => 150,
                'therapeutic_area' => 'Oncologie',
            ],
            [
                'name' => 'Étude de l’Insuffisance Cardiaque en milieu hospitalier',
                'protocol_code' => 'CARDIO-2026-AL',
                'protocol_version' => '2.1',
                'phase' => 'Observational',
                'status' => 'Draft',
                'target_inclusions' => 500,
                'therapeutic_area' => 'Cardiologie',
            ],
            [
                'name' => 'Nouvel agent antiviral contre l\'Hépatite B récurrente',
                'protocol_code' => 'HEP-B-NEW',
                'protocol_version' => '1.2',
                'phase' => 'Phase II',
                'status' => 'Draft',
                'target_inclusions' => 80,
                'therapeutic_area' => 'Infectiologie',
            ],
            [
                'name' => 'Suivi de la Sclérose en Plaques - Cohorte Alger',
                'protocol_code' => 'SEP-ALG-01',
                'protocol_version' => '1.0',
                'phase' => 'Phase IV',
                'status' => 'Closed', // 'Closed' est autorisé par ta migration
                'target_inclusions' => 200,
                'therapeutic_area' => 'Neurologie',
            ]
        ];

        foreach ($studies as $studyData) {
            Study::create(array_merge($studyData, [
                'sponsor_id' => $sponsor->id,
                // Date de protocole : 3 mois dans le passé
                'protocol_date' => Carbon::now()->subMonths(3),
                // Date de début : entre aujourd'hui et dans 30 jours (respecte ta règle React)
                'start_date' => Carbon::now()->addDays(rand(0, 30)),
            ]));
        }

        $this->command->info('Table Studies populée avec succès (4 études ajoutées) !');
    }
}