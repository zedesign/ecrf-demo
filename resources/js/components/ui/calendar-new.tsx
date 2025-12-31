{/* Exemple pour la Date de début */}
<Popover>
    <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-normal bg-white", !data.start_date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {data.start_date ? format(data.start_date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
        </Button>
    </PopoverTrigger>
    <PopoverContent className={cn(DROPDOWN_CONTENT_STYLE, "p-0 w-auto")} align="start">
        <div className="flex flex-col">
            <Calendar 
                mode="single" 
                selected={data.start_date} 
                onSelect={(d) => setData('start_date', d)} 
                locale={fr} 
            />
            <div className="p-2 border-t bg-slate-50 flex justify-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs font-bold text-primary hover:bg-white"
                    onClick={() => setData('start_date', new Date())}
                >
                    Aujourd'hui
                </Button>
            </div>
        </div>
    </PopoverContent>
</Popover>