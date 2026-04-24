import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiquidGradient } from "@/components/ui/LiquidGradient";
import { motion } from "framer-motion";
import { GoZap, GoProject, GoOrganization, GoSync } from "react-icons/go";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  //change if needed.
  const demoBoardId = "8722f9a8-7033-4c1a-b144-87ec9d707eda";

  return (
    <div className="relative min-h-[100dvh] md:h-screen w-full overflow-x-hidden overflow-y-auto bg-background selection:bg-primary/30 flex flex-col pt-8 md:pt-0">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <LiquidGradient />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner border border-primary/20">
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className="text-primary md:w-[22px] md:h-[22px]"><rect width='18' height='18' x='3' y='3' rx='2' /><path d='M3 9h18' /><path d='M9 21V9' /></svg>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight">Bello</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <Button variant="ghost" asChild className="px-2 md:px-4">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="rounded-full px-4 md:px-6 shadow-xl shadow-primary/20 text-xs md:text-sm h-9 md:h-10">
            <Link to="/login?tab=signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center md:px-12 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 text-primary text-sm font-medium">
            <GoZap className="w-4 h-4" />
            <span>Next Generation Project Management</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Work together, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              faster than ever.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Bello brings all your tasks, teammates, and tools together in one place.
            Stay organized and keep your projects moving forward.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-lg shadow-2xl shadow-primary/30">
              <Link to="/login?tab=signup">Start building for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-2xl text-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur border-primary/20 hover:bg-white/80 dark:hover:bg-zinc-800/80">
              <Link to={`/boards/${demoBoardId}`}>Try Live Demo</Link>
            </Button>
          </div>
        </motion.div>

        {/* Floating Mockup Preview - Mini Board Demo */}
        {/* Features Grid */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          {[
            { title: "Visual Boards", desc: "Drag and drop your way to productivity with intuitive Trello-like boards.", icon: GoProject },
            { title: "Real-time Sync", desc: "Collaborate seamlessly with your team with instant updates across all devices.", icon: GoSync },
            { title: "Team Management", desc: "Easily manage projects, permissions, and roles within your organization.", icon: GoOrganization }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl border border-white/10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-left group hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-all flex flex-col justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

      </main>

      <footer className="relative z-10 px-6 py-6 md:px-12 border-t border-white/10 text-center text-muted-foreground text-sm flex-shrink-0">
        <p>&copy; 2026 Bello. Built with love for modern teams.</p>
      </footer>
    </div>
  );
}
