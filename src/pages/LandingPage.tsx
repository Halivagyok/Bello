import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LiquidGradient } from "@/components/ui/LiquidGradient";
import { motion } from "framer-motion";
import { GoZap, GoProject, GoOrganization, GoSync, GoShieldCheck, GoLock, GoCheck, GoGrabber } from "react-icons/go";
import { ModeToggle } from "@/components/mode-toggle";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { createPortal } from "react-dom";

export default function LandingPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  // Demo state for cards
  const [demoData, setDemoData] = useState({
    col1: [
      { id: "1", content: "Drafting UI" },
      { id: "2", content: "API Review" },
    ],
    col2: [
      { id: "3", content: "User Auth" },
      { id: "4", content: "Testing" },
    ],
  });

  const toggleComplete = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
    }

    const sourceCol = source.droppableId as keyof typeof demoData;
    const destCol = destination.droppableId as keyof typeof demoData;

    const sourceItems = [...demoData[sourceCol]];
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceCol === destCol) {
        sourceItems.splice(destination.index, 0, movedItem);
        setDemoData({ ...demoData, [sourceCol]: sourceItems });
    } else {
        const destItems = [...demoData[destCol]];
        destItems.splice(destination.index, 0, movedItem);
        setDemoData({
            ...demoData,
            [sourceCol]: sourceItems,
            [destCol]: destItems,
        });
    }
  };

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
             <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className="text-primary"><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>
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
          </div>
        </motion.div>

        {/* Floating Mockup Preview - Mini Board Demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 w-full max-w-5xl rounded-3xl border border-white/20 bg-white/10 dark:bg-black/20 p-2 backdrop-blur-2xl shadow-3xl overflow-hidden"
        >
          <div className="rounded-2xl border border-white/10 bg-white/50 dark:bg-zinc-900/50 aspect-video flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-8 bg-black/5 dark:bg-white/5 border-b border-white/5 flex items-center px-4 gap-1.5 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="text-[10px] ml-auto font-bold opacity-30 tracking-widest uppercase">Interactive Demo</span>
             </div>
             
             <div className="w-full mt-4 h-full overflow-x-auto no-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-8 p-12 min-w-max">
                    {Object.entries(demoData).map(([colId, items]) => (
                        <div key={colId} className="min-w-[280px] flex-1">
                        <div className="flex flex-col gap-4 text-left">
                            <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-tighter opacity-50">
                                {colId === "col1" ? "To Do" : "In Progress"}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                {items.length}
                            </span>
                            </div>
                            
                            <Droppable droppableId={colId}>
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex flex-col gap-3 min-h-[200px]"
                                    >
                                        {items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => {
                                                    const child = (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-sm transition-colors text-left flex items-start gap-3 group ${snapshot.isDragging ? 'shadow-2xl border-primary/50 ring-2 ring-primary/20 z-[9999]' : 'hover:border-primary/30'}`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleComplete(item.id);
                                                                }}
                                                                className={`mt-0.5 shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${completed.includes(item.id) ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}
                                                            >
                                                                {completed.includes(item.id) && <GoCheck className="w-3 h-3" />}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-bold truncate ${completed.includes(item.id) ? 'line-through opacity-50' : ''}`}>{item.content}</p>
                                                                <div className="mt-3 flex items-center justify-between">
                                                                    <div className="flex gap-1">
                                                                        <div className="w-6 h-1 rounded-full bg-blue-400/30" />
                                                                        <div className="w-4 h-1 rounded-full bg-purple-400/30" />
                                                                    </div>
                                                                    <GoGrabber className="w-3 h-3 text-muted-foreground opacity-50" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );

                                                    if (snapshot.isDragging) {
                                                        return createPortal(child, document.body);
                                                    }
                                                    return child;
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                        </div>
                    ))}
                    </div>
                </DragDropContext>
             </div>
          </div>
        </motion.div>

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
        <section className="mt-40 w-full max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6 text-green-600 dark:text-green-400 text-sm font-medium">
                  <GoShieldCheck className="w-4 h-4" />
                  <span>Privacy Focused</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">Your data belongs to you.</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Bello was built with privacy in mind. We use industry-standard security measures 
                  to ensure your projects and tasks remain strictly confidential.
                </p>
                <ul className="space-y-4">
                   <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <GoLock className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Industry-standard encryption for sensitive data</span>
                   </li>
                   <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <GoLock className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Secure local-first data synchronization</span>
                   </li>
                   <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <GoLock className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Modern data protection compliance</span>
                   </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative flex justify-center"
              >
                 <div className="w-full aspect-square max-w-sm bg-primary/5 rounded-full flex items-center justify-center blur-3xl absolute opacity-50" />
                 <GoShieldCheck className="w-64 h-64 text-primary relative z-10 drop-shadow-2xl" />
              </motion.div>
           </div>
        </section>

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
