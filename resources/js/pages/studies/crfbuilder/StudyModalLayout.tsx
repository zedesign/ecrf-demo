import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LayoutProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    isEdit?: boolean;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
}

export default function StudyModalLayout({ 
    isOpen, onClose, title, description, isEdit, processing, onSubmit, children 
}: LayoutProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-xl">
                <form onSubmit={onSubmit}>
                    {/* Header dynamique selon le mode */}
                    <div className={cn(
                        "relative p-8 text-white overflow-hidden",
                        isEdit ? "bg-orange-600" : "bg-primary"
                    )}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                                {isEdit ? <AlertCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight uppercase">{title}</DialogTitle>
                                <DialogDescription className="text-white/70 font-medium">{description}</DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Le formulaire spécifique s'injectera ici */}
                    <div className="p-6 space-y-5 bg-white max-h-[60vh] overflow-y-auto">
                        {children}
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-8 font-bold uppercase text-xs tracking-widest text-slate-500">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing} className={cn(
                            "h-11 px-8 font-black uppercase text-xs tracking-widest text-white shadow-md",
                            isEdit ? "bg-orange-600 hover:bg-orange-700" : "bg-primary hover:bg-primary/90"
                        )}>
                            {processing ? <Loader2 className="animate-spin mr-2" /> : (isEdit ? "Mettre à jour" : "Lancer l'étude")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}