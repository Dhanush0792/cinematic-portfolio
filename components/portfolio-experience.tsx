"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivePanel, ParticleScene } from "@/components/particle-scene";

const ease = [0.22, 1, 0.36, 1] as const;

const panels: Record<NonNullable<ActivePanel>, { kicker: string; title: string; body: string; meta?: string[]; image?: string }> = {
  about: {
    kicker: "About",
    title: "Dhanush Siddilingam",
    body:
      "I am a full-stack developer passionate about building intelligent systems. Currently pursuing my B.Tech, I specialize in connecting complex backends with polished, intuitive frontends.",
    meta: ["Java", "React", "Python", "LLMs"],
    image: "/dhanush_image_1.jpeg"
  },
  education: {
    kicker: "Education",
    title: "Academic Journey",
    body:
      "Currently pursuing B.Tech in Electronics & Communication Engineering at Sri Venkateswara College of Engineering, Tirupati. Maintaining a strong academic record with a CGPA of 8.83.",
    meta: ["B.Tech ECE", "2022 - 2026", "CGPA 8.83"]
  },
  skills: {
    kicker: "Skills",
    title: "Technical Expertise",
    body:
      "Expertise in full-stack development, AI integration, and cloud systems. Proficient in Java, React, Python, and modern web architectures.",
    meta: ["Next.js", "Three.js", "Spring Boot", "MySQL", "Azure"]
  },
  projects: {
    kicker: "Projects",
    title: "Featured Works",
    body:
      "Building practical solutions from AI-powered memory SDKs to secure vision systems and finance management tools.",
    meta: ["AI Memory SDK", "SecureVision", "Finance Manager"]
  },
  contact: {
    kicker: "Contact",
    title: "Let's Connect",
    body:
      "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
    meta: ["Email", "LinkedIn", "GitHub", "Twitter"]
  }
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function getScrollPanel(progress: number): ActivePanel {
  if (progress > 0.35 && progress < 0.45) return "about";
  if (progress >= 0.45 && progress < 0.55) return "education";
  if (progress >= 0.55 && progress < 0.65) return "skills";
  if (progress >= 0.65 && progress < 0.75) return "projects";
  if (progress >= 0.75 && progress < 0.85) return "contact";
  return null;
}

export function PortfolioExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ActivePanel>(null);

  const scrollPanel = useMemo(() => getScrollPanel(progress), [progress]);
  const activePanel = selectedProject ?? scrollPanel;
  const panel = activePanel ? panels[activePanel] : null;

  useEffect(() => {
    const handleScroll = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      setProgress(clamp(-rect.top / scrollable));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <main ref={stageRef} className="relative min-h-[1000vh] bg-[#000000] text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <ParticleScene progress={progress} activePanel={activePanel} setActivePanel={setSelectedProject} />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-6 md:px-10 md:py-8">
          <header className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Portfolio System v1.0</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/30">{Math.round(progress * 100)}%</div>
          </header>

          <section className="relative flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              {progress > 0.05 && progress < 0.25 ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <h1 className="font-display text-5xl tracking-tight text-white md:text-8xl">
                    Welcome to my world
                  </h1>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.5em] text-white/40">Scroll to explore</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {panel ? (
                <motion.article
                  key={activePanel}
                  initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -40, scale: 1.05, filter: "blur(10px)" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-3xl md:flex-row md:p-12"
                >
                  {panel.image && (
                    <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                      <Image 
                        src={panel.image} 
                        alt={panel.title} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center md:text-left">
                    <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-blue-400/80">{panel.kicker}</p>
                    <h2 className="font-display text-4xl leading-tight text-white md:text-6xl">{panel.title}</h2>
                    <p className="mt-6 text-sm leading-relaxed text-white/60 md:text-lg">{panel.body}</p>
                    {panel.meta ? (
                      <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                        {panel.meta.map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-widest text-white/50">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              ) : null}
            </AnimatePresence>
          </section>

          <footer className="flex items-center gap-6">
            <div className="h-[2px] flex-1 bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress * 100}%` }} 
              />
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/30">
              {progress < 0.05 ? "Void" : progress < 0.3 ? "Genesis" : "Data"}
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
