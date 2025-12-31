import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Apparence',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Réglages d'apparence" />

            <div className="max-w-xl space-y-6 p-6">
                <HeadingSmall
                    title="Réglages d'apparence"
                    description="Personnalisez le thème et l'interface de votre compte"
                />
                
                {/* Conteneur stylisé pour les onglets d'apparence */}
                <div className="rounded-2xl border border-dark-cyan-100 bg-white p-6 shadow-sm">
                    <AppearanceTabs />
                </div>
            </div>
        </AppLayout>
    );
}