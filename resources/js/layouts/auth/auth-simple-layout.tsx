import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <main className="mt-0 min-h-screen bg-white">
            <section>
                <div className="relative flex min-h-screen items-center p-0 overflow-hidden">
                    <div className="container z-10 mx-auto">
                        <div className="flex flex-wrap">
                            {/* SECTION GAUCHE (TEXTE & VISUEL) */}
                            <div className="hidden lg:block lg:w-7/12">
                                <div className="absolute inset-y-0 left-0 w-5/12 overflow-hidden">
                                    <div 
                                        className="absolute inset-0 h-full bg-cover bg-center"
                                        style={{ 
                                            // Chemin vers votre image de fond dans public/assets/img/
                                            backgroundImage: "url('/assets/img/image-sign-up-1.jpg')",
                                            backgroundColor: '#9b66ff' 
                                        }}
                                    > 
                                        <div className="relative flex h-full flex-col justify-center px-16 text-left">
                                            <div className="max-w-sm">
                                                <h1 className="mb-4 text-5xl font-extrabold text-white">
                                                    Commencez votre nouvelle expérience.
                                                </h1>
                                                <p className="mb-6 text-white opacity-80">
                                                    Créez vos études et cahiers d'observations en quelques clics. 
                                                    Collectez, gérez et suivez vos données en temps réel grâce à notre 
                                                    plateforme EDC innovante, conforme et sécurisée.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {/* Groupe d'avatars avec images réelles */}
                                                    <div className="flex -space-x-2">
                                                        <img 
                                                            src="/assets/img/team-7.jpg" 
                                                            alt="User 1" 
                                                            className="h-8 w-8 rounded-full border-2 border-white object-cover" 
                                                        />
                                                        <img 
                                                            src="/assets/img/team-8.jpg" 
                                                            alt="User 2" 
                                                            className="h-8 w-8 rounded-full border-2 border-white object-cover" 
                                                        />
                                                    </div>
                                                    <p className="text-sm font-bold text-white">
                                                        Premier Builder d'eCRF en Algérie.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="absolute bottom-10 left-16">
                                                <h6 className="text-xs font-medium text-white opacity-70">
                                                    Copyright © 2025 Développé par HYDRA.
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION DROITE (FORMULAIRE) */}
                            <div className="flex w-full flex-col justify-center items-center px-6 lg:w-4/12 lg:px-12 min-h-screen bg-white">
                                <div className="flex flex-col py-10">
                                    <div className="mb-8 text-center">
                                        <Link href={home()} className="inline-block">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Si vous voulez remplacer l'icône par une image logo.png : */}
                                                {/* <img src="/assets/img/logo.png" alt="Logo" className="h-12 w-auto" /> */}
                                                <AppLogoIcon className="h-12 w-auto" />
                                                
                                                <div className="h-10 w-[1px] bg-gray-300 mx-2 hidden sm:block"></div>
                                                <div className="text-left leading-none">
                                                    <span className="text-[47px] font-black tracking-tight text-dark-cyan-900 uppercase">TRIALFORM</span>
                                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Créez vos e-crf en toute simplicité</p>
                                                </div>
                                            </div>
                                        </Link>
                                        <p className="mt-6 text-xs font-bold text-slate-800">
                                            Construisez vous-même vos e-CRF, avec rigueur et simplicité.
                                        </p>
                                    </div>

                                    <div className="flex-1">
                                        {children}
                                    </div>

                                    <div className="mt-6 text-center">
                                        <p className="text-[12px] text-slate-500">
                                            Veuillez contacter un administrateur pour <span className="font-bold text-slate-800 underline cursor-pointer">obtenir un compte</span>, ou <span className="font-bold text-slate-800 underline cursor-pointer">connectez-vous</span> avec vos identifiants existants.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}