import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, usePage, useForm } from '@inertiajs/react'; // Ajout de useForm

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres profil',
        href: '/settings/profile',
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name || '', 
        email: auth.user.email || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // REMPLACER route('profile.update') par '/profile' 
        // (Vérifie dans ton dossier routes/web.php que l'URL est bien /profile)
        patch('/settings/profile', { 
            preserveScroll: true,
            onSuccess: () => console.log("Profil mis à jour"),
            onError: (err) => console.error("Erreurs:", err),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres du profil" />

            <div className="max-w-xl space-y-12 pb-20 p-6">
                <section className="space-y-6">
                    <HeadingSmall
                        title="Informations personnelles"
                        description="Mettez à jour votre nom et votre adresse e-mail."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-dark-cyan-900 font-bold">Nom complet</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full border-dark-cyan-100 focus:border-dark-cyan-500 focus:ring-dark-cyan-500 rounded-xl"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-dark-cyan-900 font-bold">Adresse e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full border-dark-cyan-100 focus:border-dark-cyan-500 focus:ring-dark-cyan-500 rounded-xl"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* ... reste du code (mustVerifyEmail) ... */}

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-dark-cyan-600 hover:bg-dark-cyan-700 text-white px-8 rounded-xl shadow-lg shadow-dark-cyan-100 transition-all active:scale-95"
                            >
                                {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out duration-300"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm font-bold text-emerald-600">
                                    Modifications enregistrées !
                                </p>
                            </Transition>
                        </div>
                    </form>
                </section>

                <hr className="border-dark-cyan-50" />

                <section>
                    <DeleteUser />
                </section>
            </div>
        </AppLayout>
    );
}