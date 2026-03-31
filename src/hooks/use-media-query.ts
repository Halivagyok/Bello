import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    setValue(result.matches);
    
    // Add event listener
    result.addEventListener("change", onChange);
    
    // Clean up
    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}
