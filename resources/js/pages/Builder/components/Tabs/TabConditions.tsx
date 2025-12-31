import React from 'react';
import { Zap } from 'lucide-react';

export const TabConditions = () => {
    return (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-100 animate-in fade-in duration-300">
            <Zap size={40} className="mb-4 text-[#0891b2] opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Options Conditions bientôt disponibles</p>
        </div>
    );
};