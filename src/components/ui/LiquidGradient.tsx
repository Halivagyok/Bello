import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface LiquidGradientProps {
  colors?: [string, string, string];
  darkColors?: [string, string, string];
  speed?: number;
  className?: string;
  intensity?: number;
}

export function LiquidGradient({
  colors = ["#75DDFA", "#1893CC", "#DBEAFE"],
  darkColors = ["#0284C7", "#082f49", "#0F172A"],
  speed = 15,
  intensity = 1.2,
  className,
}: LiquidGradientProps) {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const isDark = 
    theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const activeColors = isDark ? darkColors : colors;

  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center transform-gpu", 
        className
      )}
      style={{ 
        backgroundColor: activeColors[2],
        WebkitMaskImage: '-webkit-radial-gradient(white, black)' // Forces Safari layer
      }} 
    >
      <div 
        className="absolute inset-[0] filter blur-[90px] md:blur-[120px] opacity-100 saturate-[1.2] transform-gpu"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        {/* Main large fluid blob */}
        <motion.div
          animate={{
            x: ["-10%", "20%", "-20%", "-10%"],
            y: ["0%", "30%", "-10%", "0%"],
            scale: [1, intensity, 0.9, 1],
            rotate: [0, 90, 180, 0],
          }}
          transition={{ duration: speed * 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-[100%] opacity-90 transform-gpu"
          style={{ backgroundColor: activeColors[0], transform: 'translateZ(0)' }}
        />
        
        {/* Core striking color blob */}
        <motion.div
          animate={{
            x: ["20%", "-30%", "20%"],
            y: ["10%", "-20%", "10%"],
            scale: [intensity, 0.8, intensity],
            rotate: [180, 90, 180],
          }}
          transition={{ duration: speed * 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[50%] h-[70%] rounded-[100%] opacity-[0.85] transform-gpu"
          style={{ backgroundColor: activeColors[1], transform: 'translateZ(0)' }}
        />
        
        {/* Bright highlight blob - using standard opacity instead of mix-blend to protect Safari */}
        <motion.div
          animate={{
            x: ["-15%", "35%", "-15%"],
            y: ["-20%", "20%", "-20%"],
            scale: [0.9, intensity * 1.1, 0.9],
            rotate: [90, 270, 90],
          }}
          transition={{ duration: speed * 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[20%] w-[70%] h-[50%] rounded-[100%] opacity-70 transform-gpu"
          style={{ backgroundColor: activeColors[2], transform: 'translateZ(0)' }}
        />
        
        {/* Depth shadow/contrast blob */}
        <motion.div
          animate={{
            x: ["30%", "10%", "-10%", "30%"],
            y: ["30%", "-30%", "20%", "30%"],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, -90, -180, 0],
          }}
          transition={{ duration: speed * 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-[100%] opacity-60 transform-gpu"
          style={{ backgroundColor: activeColors[1], transform: 'translateZ(0)' }}
        />
      </div>
      
      {/* Light noise overlay for texture. A hallmark of the Framer effect */}
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
