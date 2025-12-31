import React from 'react';
import AppLayout from '@/layouts/app-layout'; // Le layout principal avec la sidebar
import { Head } from '@inertiajs/react';

export default function Index({ studyId }: { studyId: string }) {
    return (
        <AppLayout>
            <Head title="Configuration eCRF" />
            
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Constructeur d'eCRF</h2>
                </div>
                
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center border">
                        Configuration de l'étude : {studyId}
                    </div>
                </div>

                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min border p-6">
                    <p className="text-muted-foreground">
                        L'interface de construction des formulaires sera développée ici.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}