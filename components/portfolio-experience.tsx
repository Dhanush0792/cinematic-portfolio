"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ParticleScene = dynamic(() => import("@/components/particle-scene").then(mod => mod.ParticleScene), { ssr: false });
import { ActivePanel } from "@/components/particle-scene";

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

export type ScrollState = ActivePanel | "projects_idle";

function getScrollPanel(progress: number): ScrollState {
  if (progress > 0.35 && progress < 0.43) return "about";
  if (progress > 0.46 && progress < 0.54) return "education";
  if (progress > 0.57 && progress < 0.65) return "skills";
  if (progress > 0.68 && progress < 0.76) return "projects_idle";
  if (progress > 0.79 && progress < 0.87) return "contact";
  return null;
}

export function PortfolioExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ActivePanel>(null);

  const scrollPanel = useMemo(() => getScrollPanel(progress), [progress]);
  
  // Auto-clear selected project if we scroll out of the projects area
  useEffect(() => {
    if (scrollPanel !== "projects_idle" && selectedProject === "projects") {
      setSelectedProject(null);
    }
  }, [scrollPanel, selectedProject]);

  const activePanel = selectedProject ?? (scrollPanel === "projects_idle" ? null : scrollPanel);
  const panel = activePanel ? panels[activePanel as Exclude<ActivePanel, null>] : null;

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
        <ParticleScene progress={progress} scrollState={scrollPanel} activePanel={activePanel as ActivePanel} setActivePanel={setSelectedProject} />

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
                  initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(24px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, scale: 1.02, filter: "blur(12px)" }}
                  transition={{ duration: 1.2, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto flex w-full max-w-4xl flex-col items-center gap-8 rounded-3xl border border-white/[0.08] bg-[rgba(20,20,30,0.6)] p-8 backdrop-blur-[18px] md:flex-row md:p-12"
                >
                  {activePanel === "education" ? (
                    <div className="flex-1 text-left w-full">
                      <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-cyan-400/80">Education</p>
                      
                      <div className="relative flex flex-col gap-8 border-l border-white/10 pl-6">
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-cyan-400"></div>
                          <div className="text-lg font-medium text-white">Bachelor of Technology (B.Tech) – ECE</div>
                          <div className="mt-1 text-sm text-white/50">Sri Venkateswara College of Engineering, Tirupati &nbsp;·&nbsp; 2022 – 2026</div>
                          <div className="mt-1 text-xs text-cyan-400/60">CGPA: 8.83 / 10</div>
                          <p className="mt-3 text-sm leading-relaxed text-white/60">Focused on core engineering fundamentals with emphasis on systems, computing, and software development. Developed strong problem-solving skills and practical experience through academic and self-driven projects.</p>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full border border-white/30 bg-[#14141E]"></div>
                          <div className="text-lg font-medium text-white">Intermediate (Class 12)</div>
                          <div className="mt-1 text-sm text-white/50">Gurudeva Vasistah Junior College, Kodur &nbsp;·&nbsp; 2020 – 2022</div>
                          <div className="mt-1 text-xs text-cyan-400/60">Percentage: 87.6%</div>
                          <p className="mt-3 text-sm leading-relaxed text-white/60">Built a strong foundation in mathematics, logical reasoning, and analytical thinking.</p>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full border border-white/30 bg-[#14141E]"></div>
                          <div className="text-lg font-medium text-white">Secondary School Certificate (Class 10)</div>
                          <div className="mt-1 text-sm text-white/50">Silver Bells English Medium High School, Kodur &nbsp;·&nbsp; 2020</div>
                          <div className="mt-1 text-xs text-cyan-400/60">CGPA: 10 / 10</div>
                          <p className="mt-3 text-sm leading-relaxed text-white/60">Demonstrated academic consistency and strong foundational understanding across subjects.</p>
                        </div>
                      </div>
                    </div>
                  ) : activePanel === "skills" ? (
                    <div className="w-full flex-1 text-center md:text-left">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-green-400/80">Capabilities</p>
                      <h2 className="mb-8 font-display text-4xl leading-tight text-white md:text-5xl">What I <span className="text-white/40">bring</span></h2>
                      
                      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        {[
                          { title: "Backend & Systems", tags: ["Java", "SQL", "REST APIs", "Databases"] },
                          { title: "Full Stack Development", tags: ["HTML", "CSS", "JS", "React", "APIs"] },
                          { title: "AI / Applied Learning", tags: ["Python", "ML Basics", "LLMs", "Data"] },
                          { title: "Databases", tags: ["MySQL", "PostgreSQL", "Schemas"] },
                          { title: "Tools & Platforms", tags: ["Git", "GitHub", "VS Code", "Postman", "OCI"] },
                          { title: "Core Concepts", tags: ["OOP", "Data Structures", "System Workflows"] },
                        ].map((skill, i) => (
                          <div key={i} className="flex flex-col items-start rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left transition-colors hover:border-green-400/30 hover:bg-white/[0.04]">
                            <div className="mb-3 text-lg text-white">{skill.title}</div>
                            <div className="flex flex-wrap gap-2">
                              {skill.tags.map(tag => (
                                <span key={tag} className="rounded-md bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-white/50">{tag}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
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
                        <p className={`mb-4 text-[10px] uppercase tracking-[0.4em] ${activePanel === 'projects' ? 'text-amber-400/80' : activePanel === 'contact' ? 'text-red-400/80' : 'text-violet-400/80'}`}>{panel.kicker}</p>
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
                    </>
                  )}
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
