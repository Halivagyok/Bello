import { useState, useEffect, useRef } from 'react';
import { useStore, type Label, type BoardFilterDueOption, type BoardFilterStatusOption } from '../store';
import { Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function BoardFilter() {
    const { 
        boardFilterQuery, 
        boardFilterDue, 
        boardFilterStatus,
        boardFilterLabels, 
        setBoardFilterQuery, 
        setBoardFilterDue, 
        setBoardFilterStatus,
        toggleBoardFilterLabel, 
        clearBoardFilters,
        activeProjectId,
        fetchProjectLabels
    } = useStore(state => state);

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [projectLabels, setProjectLabels] = useState<Label[]>([]);

    useEffect(() => {
        if (isOpen && activeProjectId) {
            fetchProjectLabels(activeProjectId).then(setProjectLabels);
        }
    }, [isOpen, activeProjectId, fetchProjectLabels]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasFilters = boardFilterQuery || boardFilterDue !== 'all' || boardFilterStatus !== 'all' || boardFilterLabels.length > 0;

    return (
        <div className="relative z-40 flex items-center" ref={containerRef}>
            <Button 
                variant={hasFilters ? "default" : "ghost"} 
                size="icon" 
                className={`h-9 w-9 relative transition-colors ${!hasFilters ? 'text-white bg-white/10 hover:bg-white/20' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Board Filter"
            >
                <Filter className="w-4 h-4" />
                {hasFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-black/20" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute top-12 left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 w-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-sm font-semibold">
                        <span>Filter Board</span>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearBoardFilters} className="h-6 px-2 text-xs text-red-500 hover:text-red-600 dark:hover:bg-red-950/30">
                                Clear All
                            </Button>
                        )}
                    </div>
                    
                    <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keyword</label>
                            <Input 
                                value={boardFilterQuery}
                                onChange={(e) => setBoardFilterQuery(e.target.value)}
                                placeholder="Search this board..."
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Completion</label>
                            <select
                                value={boardFilterStatus}
                                onChange={(e) => setBoardFilterStatus(e.target.value as BoardFilterStatusOption)}
                                className="w-full text-sm p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="all">All cards</option>
                                <option value="not-completed">Not completed only</option>
                                <option value="completed">Completed only</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</label>
                            <select
                                value={boardFilterDue}
                                onChange={(e) => setBoardFilterDue(e.target.value as BoardFilterDueOption)}
                                className="w-full text-sm p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="all">Any time</option>
                                <option value="next-7-days">Due in next 7 days</option>
                                <option value="next-14-days">Due in next 14 days</option>
                                <option value="overdue">Overdue</option>
                                <option value="no-due-date">No due date</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Labels</label>
                            <div className="flex flex-col gap-1.5">
                                {projectLabels.length > 0 ? projectLabels.map((label) => {
                                    const isSelected = boardFilterLabels.includes(label.id);
                                    return (
                                        <label 
                                            key={label.id}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors border ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleBoardFilterLabel(label.id)}
                                                className="hidden"
                                            />
                                            <div 
                                                className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}
                                            >
                                                {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                            </div>
                                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                                            <span className="text-sm font-medium truncate">{label.title}</span>
                                        </label>
                                    );
                                }) : (
                                    <div className="text-xs text-zinc-500 italic py-1">No labels found for this project.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
