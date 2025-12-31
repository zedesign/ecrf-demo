import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfToday, setYear, setMonth, getYear, getMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DateRendererProps {
    field: {
        id: string;
        settings?: {
            dateFormat?: 'date' | 'time' | 'datetime' | 'year' | 'month-year' | 'partial';
            disablePastDates?: boolean;
        };
    };
    value: any;
    onChange: (fieldId: string, value: any) => void;
}

const DateRenderer = ({ field, value, onChange }: DateRendererProps) => {
    const mode = field.settings?.dateFormat || 'date';
    const shouldDisablePast = field.settings?.disablePastDates || false;
    const today = startOfToday();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const selectedDate = value ? new Date(value) : null;
    const [viewDate, setViewDate] = useState(selectedDate || today);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const [hasJustSelectedDate, setHasJustSelectedDate] = useState(false);
    const [hasJustSelectedTime, setHasJustSelectedTime] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setHasJustSelectedDate(false);
            setHasJustSelectedTime(false);
        }
    }, [isOpen]);

    const updatePosition = useCallback(() => {
        if (containerRef.current && popoverRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const popoverHeight = popoverRect.height || (mode === 'datetime' ? 400 : 350);
            
            const spaceBelow = window.innerHeight - rect.bottom;
            const shouldOpenUp = spaceBelow < popoverHeight && rect.top > popoverHeight;
            
            setCoords({
                top: shouldOpenUp ? rect.top + window.scrollY - popoverHeight - 8 : rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
            requestAnimationFrame(() => setIsMounted(true));
        }
    }, [mode, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(updatePosition, 0);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        } else {
            setIsMounted(false);
        }
    }, [isOpen, updatePosition]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node) && !popoverRef.current?.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const handleSelectDate = (date: Date) => {
        if (selectedDate && mode === 'datetime') {
            date.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        }
        onChange(field.id, date);
        if (mode === 'datetime') {
            setHasJustSelectedDate(true);
            if (hasJustSelectedTime) setIsOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelectTime = (timeStr: string) => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        const [h, m] = timeStr.split(':').map(Number);
        d.setHours(h, m);
        onChange(field.id, new Date(d));
        if (mode === 'datetime') {
            setHasJustSelectedTime(true);
            if (hasJustSelectedDate) setIsOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    const handleNumberChange = (key: string, val: string, max: number) => {
        const onlyNums = val.replace(/[^0-9]/g, '');
        const p = value || { year: '', month: '', day: '' };
        onChange(field.id, { ...p, [key]: onlyNums.slice(0, max) });
    };

    if (mode === 'partial') {
        const p = value || { year: '', month: '', day: '' };
        // CHANGEMENT ICI : bg-white au lieu de zinc-50/50
        const inputBase = "h-14 w-full rounded-2xl border border-zinc-200 bg-white text-center outline-none font-black text-[11px] tracking-widest focus:border-dark-cyan-600 transition-all uppercase";
        return (
            <div className="grid grid-cols-3 gap-2 w-full">
                <input placeholder="YYYY" value={p.year} onChange={(e) => handleNumberChange('year', e.target.value, 4)} className={inputBase} />
                <input placeholder="MM" value={p.month} onChange={(e) => handleNumberChange('month', e.target.value, 2)} className={inputBase} />
                <input placeholder="DD" value={p.day} onChange={(e) => handleNumberChange('day', e.target.value, 2)} className={inputBase} />
            </div>
        );
    }

    const renderCalendar = () => {
        const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
        const days = [];
        let curr = start;
        while (curr <= end) { days.push(curr); curr = addDays(curr, 1); }

        return (
            <div className="w-[300px] bg-white flex flex-col border-r border-zinc-100">
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{format(viewDate, 'MMMM yyyy', { locale: fr })}</span>
                        <div className="flex gap-1">
                            <button type="button" onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1.5 hover:bg-zinc-50 rounded-full"><ChevronLeft size={16}/></button>
                            <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1.5 hover:bg-zinc-50 rounded-full"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 flex-1">
                        {['L','M','M','J','V','S','D'].map(d => <div key={d} className="text-[9px] font-black text-zinc-300 text-center py-1">{d}</div>)}
                        {days.map((day, i) => {
                            const isPast = shouldDisablePast && isBefore(day, today);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            return (
                                <button key={i} type="button" disabled={isPast} onClick={() => handleSelectDate(day)}
                                    className={cn("h-8 w-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center m-auto",
                                        !isSameMonth(day, viewDate) && "text-zinc-200",
                                        isPast && "text-zinc-200 line-through opacity-50",
                                        isSelected ? "bg-dark-cyan-600 text-white" : isSameDay(day, today) ? "text-dark-cyan-600 bg-cyan-50" : "hover:bg-zinc-50 text-zinc-600"
                                    )}
                                >{format(day, 'd')}</button>
                            );
                        })}
                    </div>
                </div>
                <button type="button" onClick={() => { setViewDate(today); handleSelectDate(today); }} className="py-4 border-t border-zinc-50 text-[10px] font-black uppercase tracking-widest text-dark-cyan-600 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                    <Target size={14}/> Aujourd'hui
                </button>
            </div>
        );
    };

    const renderTime = () => {
        const items = Array.from({ length: 48 }, (_, i) => {
            const h = Math.floor(i/2); const m = i%2 === 0 ? '00' : '30';
            return `${h.toString().padStart(2, '0')}:${m}`;
        });
        return (
            <div className="w-[100px] overflow-y-auto custom-scrollbar bg-white max-h-[400px]">
                {items.map(t => (
                    <button key={t} type="button" onClick={() => handleSelectTime(t)} 
                        className={cn("w-full py-4 text-[12px] font-bold border-b border-zinc-50 transition-all",
                        selectedDate && format(selectedDate, 'HH:mm') === t ? "text-dark-cyan-600 bg-cyan-50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50")}>
                        {t}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearMonthGrid = () => (
        <div className="p-6 w-[320px] bg-white">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setViewDate(subMonths(viewDate, mode === 'year' ? 144 : 12))} className="p-1.5 hover:bg-zinc-50 rounded-full"><ChevronLeft size={16}/></button>
                <span className="text-[10px] font-black tracking-widest uppercase">{mode === 'year' ? "Sélectionner Année" : getYear(viewDate)}</span>
                <button onClick={() => setViewDate(addMonths(viewDate, mode === 'year' ? 144 : 12))} className="p-1.5 hover:bg-zinc-50 rounded-full"><ChevronRight size={16}/></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {(mode === 'year' ? Array.from({ length: 12 }, (_, i) => getYear(viewDate) - 5 + i) : ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOÛ", "SEP", "OCT", "NOV", "DÉC"]).map((item, i) => {
                    const isSelected = mode === 'year' ? getYear(selectedDate || new Date(0)) === item : getMonth(selectedDate || new Date(0)) === i && getYear(selectedDate || new Date(0)) === getYear(viewDate);
                    const isPast = shouldDisablePast && (mode === 'year' ? (item as number) < getYear(today) : (getYear(viewDate) < getYear(today) || (getYear(viewDate) === getYear(today) && i < getMonth(today))));
                    return (
                        <button key={i} disabled={isPast} onClick={() => handleSelectDate(mode === 'year' ? setYear(selectedDate || today, item as number) : setMonth(setYear(selectedDate || today, getYear(viewDate)), i))}
                            className={cn("h-14 rounded-2xl border text-[10px] font-black tracking-widest transition-all",
                                isSelected ? "bg-dark-cyan-600 border-dark-cyan-600 text-white" : isPast ? "bg-zinc-50 text-zinc-200 line-through opacity-50" : "bg-zinc-50/50 border-transparent text-zinc-400 hover:border-dark-cyan-600 hover:text-dark-cyan-600")}
                        >{item}</button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="w-full relative" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} 
                className={cn("w-full h-14 rounded-2xl border transition-all flex items-center justify-between px-6 cursor-pointer shadow-sm bg-white",
                isOpen ? "border-dark-cyan-600 ring-4 ring-dark-cyan-600/5" : "border-zinc-200 hover:bg-white")}>
                <span className={cn("text-[11px] font-black tracking-widest uppercase", !selectedDate ? "text-zinc-300" : "text-zinc-900")}>
                    {selectedDate ? format(selectedDate, mode === 'year' ? 'yyyy' : mode === 'month-year' ? 'MMMM yyyy' : mode === 'time' ? 'HH:mm' : mode === 'datetime' ? "dd/MM/yyyy HH:mm" : 'dd/MM/yyyy', { locale: fr }) : "SÉLECTIONNER"}
                </span>
                {mode === 'time' ? <Clock size={16} className="text-zinc-400" /> : <Calendar size={16} className="text-zinc-400" />}
            </div>

            {isOpen && createPortal(
                <div ref={popoverRef} 
                    className={cn(
                        "datepicker-portal fixed z-[9999] bg-white border border-zinc-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex transition-opacity duration-75",
                        isMounted ? "opacity-100" : "opacity-0"
                    )}
                    style={{ top: coords.top, left: coords.left }}>
                    {(mode === 'date' || mode === 'datetime') && renderCalendar()}
                    {(mode === 'time' || mode === 'datetime') && renderTime()}
                    {(mode === 'year' || mode === 'month-year') && renderYearMonthGrid()}
                </div>, 
                document.body
            )}
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }`}</style>
        </div>
    );
};

export default DateRenderer;