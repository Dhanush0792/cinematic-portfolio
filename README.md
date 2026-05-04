# Dhanush Siddilingam | Cinematic Particle Universe Portfolio

Welcome to the source code for my interactive, WebGL-driven portfolio. This project moves away from the traditional static webpage, presenting my work, skills, and background as an immersive, spatial system built with **React Three Fiber** and **Framer Motion**.

---

## 👨‍💻 About Me

I am a **Full Stack Developer** and **AI Engineer** specializing in production-grade backend systems, REST API architecture, and intelligent application development. 

I recently graduated with a B.Tech in Electronics and Communication Engineering (ECE) from **Sri Venkateswara College of Engineering, Tirupati** (CGPA: 8.83). Throughout my academic and professional journey—including an internship at **Microsoft Azure** where I validated AI workflows and API pipelines—I have focused on bridging the gap between core engineering fundamentals and modern software systems.

Whether I am designing a Java Spring database context or engineering a LangChain agent loop, I build software that is robust, scalable, and intelligent.

---

## 🛠️ Capabilities & Tech Stack

* **Backend & Systems:** Java, Python, SQL, REST API Architecture, Relational Database Design
* **Frontend Development:** React, Next.js, TypeScript, Three.js, Framer Motion, HTML/CSS
* **AI & Machine Learning:** LLM Integration, LangChain, Data Processing pipelines
* **Cloud & Tools:** Microsoft Azure, Oracle Cloud Infrastructure (OCI), Git, Postman

---

## 🌌 About This Repository (The Engine)

This portfolio is built as a state-driven cinematic experience. Instead of scrolling down a page, the user scrolls *through* space.

### Core Architecture
* **Framework:** Next.js (App Router)
* **3D Engine:** Three.js via React Three Fiber (@react-three/fiber)
* **Animation & UI:** Framer Motion (Glassmorphism panels, strict entry/exit easing)
* **Post-Processing:** `@react-three/postprocessing` (Threshold Bloom, Depth Fade, Color Grading)

### The Physics System
The particle engine relies on a heavily optimized, custom `InstancedMesh`-style buffer using raw `Float32Arrays`. Interactions are strictly driven by a dynamic **mass-spring-damper** physics loop:
1. **Damped Motion:** When activated, particles snap out using high tension and settle slowly using heavy mathematical friction.
2. **Glass Blur Handoff:** Custom fragment shaders transition the sharp WebGL point sprites into diffuse, soft-edged transmission hazes the exact millisecond the Framer Motion UI layers mount.
3. **Interactive Nodes:** The "Projects" system utilizes R3F raycasting to create a distinct orbital interaction system rather than a passive scroll-trigger.

---

## 📬 Contact
Feel free to reach out to discuss systems architecture, AI development, or full-stack engineering opportunities.

* **GitHub:** [@Dhanush0792](https://github.com/Dhanush0792)
