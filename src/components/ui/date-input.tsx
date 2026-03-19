import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { GoCalendar } from "react-icons/go"

interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

export function DateInput({ value, onChange, className }: DateInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  // Sync prop value (YYYY-MM-DD) to internal display value (YYYY/MM/DD)
  React.useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setInputValue(`${parts[0]}/${parts[1]}/${parts[2]}`);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 4) {
      formatted = val.slice(0, 4) + '/' + val.slice(4);
    }
    if (val.length > 6) {
      formatted = formatted.slice(0, 7) + '/' + formatted.slice(7);
    }
    
    setInputValue(formatted);
    
    // If complete, propagate change
    if (val.length === 8) {
      const y = val.slice(0, 4);
      const m = val.slice(4, 6);
      const d = val.slice(6, 8);
      
      // Basic validation
      const month = parseInt(m);
      const day = parseInt(d);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      }
    }
  };

  const pickerRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="relative group flex items-center w-full">
      <Input
        type="text"
        value={inputValue}
        onChange={handleTextChange}
        className={cn("pl-9 pr-10 focus:ring-1", className)}
        placeholder="yyyy/mm/dd"
      />
      <div 
        className="absolute left-3 text-zinc-500 pointer-events-none"
      >
        <GoCalendar className="w-4 h-4" />
      </div>
      <div 
        className="absolute right-3 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-primary transition-colors h-full px-1"
        onClick={() => pickerRef.current?.showPicker?.()}
        title="Open calendar"
      >
        <GoCalendar className="w-4 h-4" />
      </div>
      <input
        ref={pickerRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  )
}
