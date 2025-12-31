import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Sécurité 2FA',
        href: '/settings/two-factor',
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fonction pour désactiver la 2FA
    const disable2FA = () => {
        router.delete(route('two-factor.disable'), {
            onBefore: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
        });
    };

    // Fonction pour activer la 2FA
    const enable2FA = () => {
        router.post(route('two-factor.enable'), {}, {
            onBefore: () => setIsProcessing(true),
            onSuccess: () => setShowSetupModal(true),
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Authentification à deux facteurs" />

            <div className="max-w-xl space-y-6 p-6">
                <HeadingSmall
                    title="Authentification à deux facteurs (2FA)"
                    description="Ajoutez une couche de sécurité supplémentaire à votre compte en utilisant une application d'authentification."
                />

                <div className="rounded-2xl border border-dark-cyan-100 bg-white p-6 shadow-sm space-y-6">
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 px-3 py-1 font-bold">
                                Activée
                            </Badge>
                            <p className="text-sm text-dark-cyan-700">
                                Lorsque l'authentification à deux facteurs est activée, vous devrez saisir un code sécurisé généré par votre application TOTP (comme Google Authenticator ou Microsoft Authenticator) lors de la connexion.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <Button
                                variant="destructive"
                                onClick={disable2FA}
                                disabled={isProcessing}
                                className="rounded-xl font-bold flex gap-2"
                            >
                                <ShieldBan className="w-4 h-4" /> Désactiver la 2FA
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive" className="px-3 py-1 font-bold uppercase tracking-tighter">
                                Désactivée
                            </Badge>
                            <p className="text-sm text-dark-cyan-600">
                                Protégez votre compte eCRF. Une fois activé, un jeton numérique aléatoire sera requis pour valider votre identité lors de l'accès.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        className="bg-dark-cyan-600 hover:bg-dark-cyan-700 rounded-xl font-bold flex gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Continuer la configuration
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={enable2FA}
                                        disabled={isProcessing}
                                        className="bg-dark-cyan-600 hover:bg-dark-cyan-700 rounded-xl font-bold flex gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Activer la 2FA
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </div>
        </AppLayout>
    );
}