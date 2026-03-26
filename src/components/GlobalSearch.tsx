import { useState, useEffect, useRef } from 'react';
import { useStore, type Card } from '../store';
import { GoSearch, GoX, GoClock, GoLocation } from 'react-icons/go';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { CardDetailsDialog } from './CardDetailsDialog';

export function GlobalSearch() {
    const searchCards = useStore(state => state.searchCards);
    const [query, setQuery] = useState('');
    const [dueSoon, setDueSoon] = useState(false);
    const [results, setResults] = useState<Card[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen && !query && !dueSoon) return;

        const delayDebounceFn = setTimeout(async () => {
            if (!query.trim() && !dueSoon) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            const data = await searchCards(query.trim(), dueSoon);
            setResults(data);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, dueSoon, searchCards, isOpen]);

    return (
        <div className="relative z-50 flex items-center" ref={containerRef}>
            <div className={`flex items-center transition-all duration-300 ${isOpen ? 'w-64 sm:w-80' : 'w-9'}`}>
                {isOpen ? (
                    <div className="relative w-full">
                        <GoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <Input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search cards..."
                            className="w-full h-9 pl-9 pr-20 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
                            autoFocus
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                onClick={() => setDueSoon(!dueSoon)}
                                className={`p-1 rounded text-xs px-1.5 font-medium transition-colors ${dueSoon ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:text-white tilt'} `}
                                title="Due Soon"
                            >
                                <GoClock className="w-3.5 h-3.5 inline mr-1" />
                                7d
                            </button>
                            <button 
                                onClick={() => { setIsOpen(false); setQuery(''); setDueSoon(false); }}
                                className="p-1 rounded hover:bg-white/20 text-white/60 hover:text-white"
                            >
                                <GoX className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Global Search"
                    >
                        <GoSearch className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (query || dueSoon || isSearching) && (
                <div className="absolute top-12 right-0 w-[400px] max-w-[90vw] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[70vh]">
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-between items-center text-xs font-medium text-zinc-500">
                        <span>Search Results</span>
                        {isSearching && <span className="animate-pulse">Searching...</span>}
                    </div>
                    
                    <div className="overflow-y-auto p-2 flex flex-col gap-2">
                        {!isSearching && results.length === 0 && (
                            <div className="py-8 text-center text-sm text-zinc-500">
                                No cards found matching your criteria.
                            </div>
                        )}
                        
                        {results.map(card => (
                            <div 
                                key={card.id}
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelectedCard(card);
                                }}
                                className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md cursor-pointer transition-all flex flex-col gap-2 group"
                            >
                                {card.labels && card.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {card.labels.map(label => (
                                            <div 
                                                key={label.id}
                                                className="px-1.5 py-0.5 text-[10px] font-medium leading-tight rounded-sm opacity-90 group-hover:opacity-100"
                                                style={{ backgroundColor: label.color, color: '#fff' }}
                                            >
                                                {label.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className={`text-sm font-medium ${card.completed ? "line-through opacity-50" : "text-zinc-900 dark:text-zinc-100"}`}>
                                    {card.content}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                                    {card.dueDate && (
                                        <div className="flex items-center gap-1.5">
                                            <GoClock className="w-3.5 h-3.5" />
                                            <span>{format(new Date(card.dueDate), 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    {card.location && (
                                        <div className="flex items-center gap-1.5">
                                            <GoLocation className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[120px]">{card.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <CardDetailsDialog 
                card={selectedCard} 
                open={!!selectedCard} 
                onOpenChange={(open) => {
                    if (!open) setSelectedCard(null);
                }} 
            />
        </div>
    );
}
