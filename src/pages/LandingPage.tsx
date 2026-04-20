import { useState } from "react";
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
    <div className="relative min-h-screen w-full overflow-hidden bg-background selection:bg-primary/30">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <LiquidGradient />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner border border-primary/20">
            <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className="text-primary"><rect width='18' height='18' x='3' y='3' rx='2' /><path d='M3 9h18' /><path d='M9 21V9' /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Bello</span>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-xl shadow-primary/20">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center md:px-12 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 text-primary text-sm font-medium">
            <GoZap className="w-4 h-4" />
            <span>Next Generation Project Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Work together, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              faster than ever.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Bello brings all your tasks, teammates, and tools together in one place.
            Stay organized and keep your projects moving forward.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="h-14 px-8 rounded-2xl text-lg shadow-2xl shadow-primary/30">
              <Link to="/login">Start building for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-2xl text-lg bg-white/50 dark:bg-zinc-800/50 backdrop-blur border-primary/20 hover:bg-white/80 dark:hover:bg-zinc-800/80">
              <Link to={`/boards/${demoBoardId}`}>Try Live Demo</Link>
            </Button>
          </div>
        </motion.div>

        {/* Floating Mockup Preview - Mini Board Demo */}
        {/* Features Grid */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
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
              className="p-8 rounded-3xl border border-white/10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-left group hover:bg-white/40 dark:hover:bg-zinc-900/40 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Privacy Section */}

        {/* CTA Section */}
        <section className="mt-40 mb-20 w-full max-w-4xl p-12 rounded-[3rem] bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your workflow?</h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-md">
              Join thousands of teams already using Bello to build their dreams.
            </p>
            <Button size="lg" variant="secondary" asChild className="h-14 px-10 rounded-2xl text-lg font-bold">
              <Link to="/login">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 py-12 md:px-12 border-t border-white/10 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 Bello. Built with love for modern teams.</p>
      </footer>
    </div>
  );
}
