import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { GoClock } from "react-icons/go"

interface TimeInputProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  // Sync prop value (HH:mm) to internal display value
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (val.length > 4) val = val.slice(0, 4);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = val.slice(0, 2) + ':' + val.slice(2);
    }
    
    setInputValue(formatted);
    
    // If complete, propagate change
    if (val.length === 4) {
      const hh = val.slice(0, 2);
      const mm = val.slice(2, 4);
      
      const hour = parseInt(hh);
      const minute = parseInt(mm);
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        onChange(`${hh}:${mm}`);
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
        placeholder="HH:mm"
      />
      <div 
        className="absolute left-3 text-zinc-500 pointer-events-none"
      >
        <GoClock className="w-4 h-4" />
      </div>
      <div 
        className="absolute right-3 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-primary transition-colors h-full px-1"
        onClick={() => pickerRef.current?.showPicker?.()}
        title="Open time picker"
      >
        <GoClock className="w-4 h-4" />
      </div>
      <input
        ref={pickerRef}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  )
}
