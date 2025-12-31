import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Importez votre JSON ici (adaptez le chemin)
import wilayasData from "@/data/states.json";

interface WilayaSelectorProps {
    value: string; // Le nom ou le code actuel
    onChange: (wilayaName: string, wilayaCode: string) => void;
    error?: string;
}

export function WilayaSelector({ value, onChange, error }: WilayaSelectorProps) {
    const [open, setOpen] = useState(false);

    // Tri pour mettre la sélection en haut et garder le reste par code
    const sortedWilayas = useMemo(() => {
        return [...wilayasData].sort((a, b) => {
            if (a.name === value) return -1;
            if (b.name === value) return 1;
            return parseInt(a.code) - parseInt(b.code);
        });
    }, [value]);

    return (
        <div className="flex flex-col gap-1.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-10 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-normal",
                            error && "border-red-500"
                        )}
                    >
                        <div className="truncate flex items-center gap-2">
                            {value ? (
                                <>
                                    {/* Badge corrigé pour un centrage parfait */}
                                    <span className="flex items-center justify-center bg-slate-100 text-slate-500 w-7 h-5 rounded text-[10px] font-bold border border-slate-200 leading-none">
                                        {wilayasData.find(w => w.name === value)?.code}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {wilayasData.find(w => w.name === value)?.name}
                                    </span>
                                </>
                            ) : (
                                <span className="text-slate-400">Sélectionner une wilaya...</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl border-slate-200 z-[100]" 
                    align="start"
                    // AJOUT ICI : Empêche le Dialog parent de capturer le scroll de la molette
                    onWheel={(e) => e.stopPropagation()}
                >
                    <Command className="rounded-xl">
                        <CommandInput placeholder="Rechercher une wilaya (ex: 16 ou Alger)..." className="h-10" />
                        <CommandList className="max-h-[280px] overflow-y-auto custom-scrollbar">
                            <CommandEmpty>Aucune wilaya trouvée.</CommandEmpty>
                            <CommandGroup>
                                {sortedWilayas.map((wilaya) => (
                                    <CommandItem
                                        key={wilaya.id}
                                        value={`${wilaya.code} ${wilaya.name}`}
                                        onSelect={() => {
                                            onChange(wilaya.name, wilaya.code);
                                            setOpen(false);
                                        }}
                                        className="flex items-center justify-between py-2.5 px-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "flex h-6 w-9 items-center justify-center rounded text-[10px] font-bold border transition-colors",
                                                value === wilaya.name 
                                                    ? "bg-dark-cyan-600 text-white border-dark-cyan-600" 
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>
                                                {wilaya.code}
                                            </div>
                                            <span className={cn(
                                                "text-sm",
                                                value === wilaya.name ? "font-bold text-dark-cyan-700" : "text-slate-600"
                                            )}>
                                                {wilaya.name}
                                            </span>
                                        </div>
                                        {value === wilaya.name && <Check className="h-4 w-4 text-dark-cyan-600" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
        </div>
    );
}