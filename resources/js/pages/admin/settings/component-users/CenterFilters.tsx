import React from 'react';
import { Input } from "@/components/ui/input";
import { WilayaSelector } from "@/pages/admin/settings/component-users/WilayaSelector";
import { Search, FilterX, Building2, Landmark, ShieldHalf } from "lucide-react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";


interface CenterFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    wilaya: string;
    onWilayaChange: (value: string) => void;
    type: string;
    onTypeChange: (value: string) => void;
    onReset: () => void;
}

export function CenterFilters({ 
    search, onSearchChange, 
    wilaya, onWilayaChange, 
    type, onTypeChange, 
    onReset 
}: CenterFiltersProps) {
    return (
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-end gap-4">
            {/* 1. Recherche Nom/Code */}
            <div className="flex-1 min-w-[200px] space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Recherche</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Nom ou code du centre..." 
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 rounded-xl border-slate-200 focus:ring-dark-cyan-600 h-10"
                    />
                </div>
            </div>

            {/* 2. Filtre Wilaya */}
            <div className="w-[200px] space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Wilaya</label>
                <WilayaSelector 
                    value={wilaya === 'all' ? '' : wilaya}
                    onChange={(val) => onWilayaChange(val || 'all')}
                />
            </div>

            {/* 3. Filtre Type */}
            <div className="w-[200px] space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Type de structure</label>
                <Select value={type} onValueChange={onTypeChange}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200">
                        <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white">
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="public">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Secteurs Public
                            </div>
                        </SelectItem>
                        <SelectItem value="private">
                            <div className="flex items-center gap-2">
                                <Landmark className="h-3.5 w-3.5 text-emerald-600" /> Secteur Privé
                            </div>
                        </SelectItem>
                        <SelectItem value="military">
                            <div className="flex items-center gap-2">
                                <ShieldHalf className="h-3.5 w-3.5 text-slate-600" /> Secteur Militaire
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bouton Reset (Optionnel mais pratique) */}
            <Button 
                variant="ghost" 
                onClick={onReset}
                className="h-10 rounded-xl px-3 text-slate-400 hover:text-red-500 hover:bg-red-50"
                title="Réinitialiser les filtres"
            >
                <FilterX className="w-5 h-5" />
            </Button>
        </div>
    );
}