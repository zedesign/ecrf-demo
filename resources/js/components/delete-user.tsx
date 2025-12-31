import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Supprimer le compte"
                description="Supprimer définitivement votre compte et toutes ses données"
            />
            
            {/* Zone d'alerte rouge */}
            <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-950/20">
                <div className="space-y-1">
                    <p className="font-bold text-red-600 dark:text-red-500">Attention</p>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">
                        Cette action est irréversible. Toutes vos données seront effacées.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            /* ✅ Force le rouge ici */
                            className="bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                            data-test="delete-user-button"
                        >
                            Supprimer le compte
                        </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="rounded-2xl border-border bg-card shadow-2xl">
                        <DialogTitle className="text-foreground font-bold text-xl">
                            Confirmation de suppression
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées. 
                            Veuillez saisir votre mot de passe pour confirmer.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6 mt-4"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-foreground font-semibold">Mot de passe</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Saisissez votre mot de passe"
                                            /* ✅ bg-white pour contrer la transparence en light mode */
                                            className="bg-white dark:bg-slate-900 border-border"
                                            autoComplete="current-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-3 mt-4">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                                                onClick={() => resetAndClearErrors()}
                                            >
                                                Annuler
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            /* ✅ Force manuellement le fond ROUGE et le texte BLANC */
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-md transition-all active:scale-95 border-none"
                                            data-test="confirm-delete-user-button"
                                        >
                                            {processing ? "Suppression..." : "Confirmer la suppression"}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}