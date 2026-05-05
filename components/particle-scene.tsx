// @ts-nocheck
"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { EffectComposer, Bloom, HueSaturation, BrightnessContrast } from "@react-three/postprocessing";
import * as THREE from "three";

export type ActivePanel = "about" | "education" | "skills" | "projects" | "contact" | null;

type ParticleSceneProps = {
  progress: number;
  scrollState: string | null;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
};

type ParticleControllerProps = ParticleSceneProps;

type ParticleData = {
  sphere: THREE.Vector3;
  field: THREE.Vector3;
  current: THREE.Vector3;
  velocity: THREE.Vector3;
  seed: number;
  size: number;
  currentSize: number;
  opacity: number;
  currentOpacity: number;
  role: ActivePanel;
  color: THREE.Color;
  clusterOffset: THREE.Vector3 | null;
};

const COUNT = 2400;
const SPHERE_RADIUS = 3.5;
const FIELD_RADIUS = 12;
const CENTER = new THREE.Vector3(0, 0, 8.5);

const SECTION_COLORS: Record<string, string> = {
  about: "#7B61FF",
  education: "#00D9FF",
  skills: "#22C55E",
  projects: "#F59E0B",
  contact: "#EF4444"
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function mapRange(value: number, start: number, end: number) {
  return clamp((value - start) / (end - start));
}

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - clamp(value), 4);
}

function makeParticles() {
  const roles: ActivePanel[] = ["about", "education", "contact"];
  const roleIndices = new Set<number>();
  while (roleIndices.size < roles.length) {
    roleIndices.add(Math.floor(Math.random() * COUNT));
  }
  const roleArray = Array.from(roleIndices);

  const skillIndices = new Set<number>();
  while (skillIndices.size < 5) {
    const idx = Math.floor(Math.random() * COUNT);
    if (!roleIndices.has(idx)) skillIndices.add(idx);
  }
  const skillArray = Array.from(skillIndices);

  const projectIndices = new Set<number>();
  while (projectIndices.size < 5) {
    const idx = Math.floor(Math.random() * COUNT);
    if (!roleIndices.has(idx) && !skillIndices.has(idx)) projectIndices.add(idx);
  }
  const projectArray = Array.from(projectIndices);

  const clusterOffsets = [
    new THREE.Vector3(-0.4,  0.4, 0),
    new THREE.Vector3( 0.4,  0.4, 0),
    new THREE.Vector3(-0.4, -0.4, 0),
    new THREE.Vector3( 0.4, -0.4, 0),
    new THREE.Vector3( 0.0,  0.0, 0)
  ];

  return Array.from({ length: COUNT }, (_, index) => {
    const phi = Math.acos(1 - (2 * (index + 0.5)) / COUNT);
    const theta = Math.PI * 2 * index * 0.618033988749;
    const r = SPHERE_RADIUS + (Math.random() - 0.5) * 0.2;
    const sphere = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    
    const field = new THREE.Vector3(
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15 - 5
    );

    const roleIdx = roleArray.indexOf(index);
    let role = roleIdx !== -1 ? roles[roleIdx] : null;
    let clusterOffset = null;
    
    const skillIdx = skillArray.indexOf(index);
    if (skillIdx !== -1) {
      role = "skills";
      clusterOffset = clusterOffsets[skillIdx];
    }
    
    if (projectArray.includes(index)) {
      role = "projects";
    }

    const color = role ? new THREE.Color(SECTION_COLORS[role]) : new THREE.Color("#6B6B7A");

    const size = role ? 2.8 : 0.6 + Math.random() * 0.9;
    const opacity = role ? 1 : 0.12 + Math.random() * 0.12;

    return {
      sphere,
      field,
      current: sphere.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      seed: Math.random() * Math.PI * 2,
      size,
      currentSize: size,
      opacity,
      currentOpacity: opacity,
      role,
      color,
      clusterOffset
    };
  });
}

function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    const zoom = easeOutQuart(mapRange(progress, 0.2, 0.4));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, THREE.MathUtils.lerp(8, 2.5, zoom), 0.05);
    
    // Subtle camera drift based on cursor
    camera.position.x += (pointer.x * 0.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.2 - camera.position.y) * 0.04;
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function ParticleController({ progress, scrollState, activePanel, setActivePanel }: ParticleControllerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempCenter = useMemo(() => new THREE.Vector3(), []);

  // Initialize particles strictly on the client
  const [particles, setParticles] = useState<ParticleData[]>([]);
  useEffect(() => {
    setParticles(makeParticles());
  }, []);

  // Reset selection when we leave the projects panel
  useEffect(() => {
    if (activePanel !== "projects") {
      setSelectedIndex(null);
    }
  }, [activePanel]);
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(COUNT * 3), []);
  const sizes = useMemo(() => new Float32Array(COUNT), []);
  const alphas = useMemo(() => new Float32Array(COUNT), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, [alphas, colors, positions, sizes]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
          attribute float size;
          attribute float alpha;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vSize;
          uniform float uPixelRatio;

          void main() {
            vColor = color;
            vSize = size;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
            
            // Depth-based alpha: particles fade out as they get further from the camera
            float depth = clamp(1.0 - (-mvPosition.z / 35.0), 0.0, 1.0);
            vAlpha = alpha * pow(depth, 1.5);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          varying float vSize;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            
            // If the particle is expanded (blob), soften the edge dramatically to simulate a blur handoff
            float edge = mix(0.5, 0.8, clamp((vSize - 2.5) / 5.0, 0.0, 1.0));
            float strength = 1.0 - smoothstep(0.0, edge, dist);
            
            // Retain a bright core for tiny stars, but wash it out when it expands
            float core = mix(1.0 - smoothstep(0.0, 0.15, dist), 0.0, clamp((vSize - 3.0) / 4.0, 0.0, 1.0));
            
            gl_FragColor = vec4(vColor, (strength + core * 0.4) * vAlpha);
          }
        `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      }),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const darkness = mapRange(progress, 0, 0.05);
    const sphereToField = easeOutQuart(mapRange(progress, 0.2, 0.4));
    const breathing = 1 + Math.sin(time * 0.6) * 0.02;
    const fieldExpansion = THREE.MathUtils.lerp(1, 6/2.5, sphereToField);

    if (!particles || particles.length === 0 || !geometry.attributes.position) return;
    
    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      
      // Calculate target position using pre-allocated vector to save memory
      let target = tempVec.copy(particle.sphere).multiplyScalar(breathing * fieldExpansion);

      // Add slight drift to field particles (Twinkle/Organic Drift)
      if (sphereToField > 0.05) {
        target.x += Math.sin(time * 0.12 + particle.seed) * 0.4 * sphereToField;
        target.y += Math.cos(time * 0.08 + particle.seed) * 0.4 * sphereToField;
        target.z += Math.sin(time * 0.1 + particle.seed * 2.0) * 0.2 * sphereToField;
      }
      
      // Determine active states
      let isActive = !!activePanel && particle.role === activePanel;
      if (activePanel === "projects") {
        isActive = (index === selectedIndex);
      }
      const isRole = !!particle.role;
      const isProjectsIdle = scrollState === "projects_idle" && !activePanel;
      const isProjectNode = particle.role === "projects";
      const isHovered = isProjectNode && index === hoveredIndex;
      const isSelected = isProjectNode && index === selectedIndex;

      let targetSize = particle.size;
      let targetAlpha = particle.opacity * darkness;
      let lerpSpeedSize = 0.06;
      let returnLerp = 0.08;

      if (isActive) {
        targetSize = 7.5;
        targetAlpha = 0.9;
        
        let activeCenter = CENTER.clone();
        let pullSpeed = 0.06;

        if (activePanel === "about") {
          pullSpeed = 0.04;
          lerpSpeedSize = 0.04;
          targetSize = 8.0;
        } else if (activePanel === "education") {
          pullSpeed = 0.08;
          activeCenter.x += 0.5;
          activeCenter.y += 0.2;
        } else if (activePanel === "projects") {
          targetSize = 8.5;
          targetAlpha = 1.0;
        } else if (activePanel === "skills") {
          pullSpeed = 0.05;
          targetSize = 4.0;
          if (particle.clusterOffset) {
            activeCenter.add(particle.clusterOffset);
          }
        }

        const toCenter = activeCenter.sub(particle.current);
        const dist = toCenter.length();
        
        // Fast snap out, slow settle (Heavy Tension Physics)
        const tension = pullSpeed * (dist > 1.5 ? 1.6 : 1.0);
        particle.velocity.add(toCenter.multiplyScalar(tension));
        
        if (dist < 0.8) {
          particle.velocity.multiplyScalar(0.68); // Extremely heavy friction near center (slow settle)
        } else {
          particle.velocity.multiplyScalar(0.84); // Normal travel friction
        }
        
        particle.current.add(particle.velocity);
        
        // Fast-start, slow-settle size/opacity interpolation
        if (dist < 0.8) {
           lerpSpeedSize = 0.015; // Barely moves when it has arrived
        } else {
           lerpSpeedSize = 0.14; // Snaps fast to scale during travel
        }
      } else {
        if (particle.role === "contact") {
          returnLerp = 0.03;
          lerpSpeedSize = 0.03;
        }
        
        // Push unselected project nodes slightly back and give them a slow orbit drift
        if (activePanel === "projects" && isProjectNode && !isSelected) {
          target.z -= 2;
          target.x += Math.sin(time * 0.4 + particle.seed) * 0.4;
          target.y += Math.cos(time * 0.4 + particle.seed) * 0.4;
        }
        
        particle.current.lerp(target, returnLerp);
        
        if (isRole) targetSize *= 1.5;
        
        // Projects idle state highlighting
        if (isProjectsIdle && isProjectNode) {
          targetSize *= 1.8;
          targetAlpha = 0.8;
        }
        
        
        // Depth-based opacity fading
        const depth = Math.abs(particle.current.z);
        targetAlpha *= clamp(1 - depth * 0.15, 0.2, 1);
        
        // Hover state
        if (isHovered && !isSelected) {
          targetSize *= 1.35;
          targetAlpha = 0.9;
        }
        
        // Dimming effects
        if (hoveredIndex !== null && !isHovered && isProjectsIdle) {
          targetAlpha *= 0.4;
        } else if (activePanel) {
          targetAlpha *= 0.3; // Dim all others when any panel is active
        }
      }
      
      positions[index * 3] = particle.current.x;
      positions[index * 3 + 1] = particle.current.y;
      positions[index * 3 + 2] = particle.current.z;

      colors[index * 3] = particle.color.r;
      colors[index * 3 + 1] = particle.color.g;
      colors[index * 3 + 2] = particle.color.b;

      // Smoothly interpolate size and opacity
      particle.currentSize = THREE.MathUtils.lerp(particle.currentSize, targetSize, lerpSpeedSize);
      particle.currentOpacity = THREE.MathUtils.lerp(particle.currentOpacity, targetAlpha, lerpSpeedSize);

      sizes[index] = particle.currentSize;
      alphas[index] = particle.currentOpacity;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;
  });

  return (
    <points 
      ref={pointsRef} 
      geometry={geometry} 
      material={material} 
      onPointerMove={(e) => {
        if (scrollState === "projects_idle" || activePanel === "projects") {
          e.stopPropagation();
          if (e.index !== undefined) {
            const p = particles[e.index];
            if (p.role === "projects") {
              setHoveredIndex(e.index);
              document.body.style.cursor = "pointer";
            }
          }
        }
      }}
      onPointerOut={() => {
        setHoveredIndex(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        if (scrollState === "projects_idle" || activePanel === "projects") {
          e.stopPropagation();
          if (e.index !== undefined) {
            const p = particles[e.index];
            if (p.role === "projects") {
              setSelectedIndex(e.index);
              setActivePanel("projects");
            }
          }
        }
      }}
    />
  );
}

export function ParticleScene(props: ParticleSceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 12], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050507"]} />
        <CameraRig progress={props.progress} />
        <ParticleController {...props} />
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.9} intensity={0.25} radius={0.8} />
          <HueSaturation saturation={-0.15} />
          <BrightnessContrast brightness={-0.02} contrast={0.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
