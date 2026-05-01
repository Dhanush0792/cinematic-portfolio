// @ts-nocheck
"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type ActivePanel = "about" | "education" | "skills" | "projects" | "contact" | null;

type ParticleSceneProps = {
  progress: number;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
};

type ParticleControllerProps = ParticleSceneProps;

type ParticleData = {
  sphere: THREE.Vector3;
  field: THREE.Vector3;
  current: THREE.Vector3;
  seed: number;
  size: number;
  opacity: number;
  role: ActivePanel;
  color: THREE.Color;
};

const COUNT = 1200;
const SPHERE_RADIUS = 3;
const FIELD_RADIUS = 10;
const CENTER = new THREE.Vector3(0, 0, 4);

const SECTION_COLORS: Record<string, string> = {
  about: "#00D9FF",
  education: "#7B61FF",
  skills: "#FF00D9",
  projects: "#00FF85",
  contact: "#FFB800"
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
  const roles: ActivePanel[] = ["about", "education", "skills", "projects", "contact"];
  const roleIndices = new Set<number>();
  while (roleIndices.size < roles.length) {
    roleIndices.add(Math.floor(Math.random() * COUNT));
  }
  const roleArray = Array.from(roleIndices);

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
    const role = roleIdx !== -1 ? roles[roleIdx] : null;
    const color = role ? new THREE.Color(SECTION_COLORS[role]) : new THREE.Color("#444455");

    return {
      sphere,
      field,
      current: sphere.clone(),
      seed: Math.random() * Math.PI * 2,
      size: role ? 2.5 : 0.5 + Math.random() * 1.5,
      opacity: role ? 1 : 0.2 + Math.random() * 0.3,
      role,
      color
    };
  });
}

function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const zoom = easeOutQuart(mapRange(progress, 0.2, 0.4));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, THREE.MathUtils.lerp(12, 5, zoom), 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function ParticleController({ progress, activePanel }: ParticleControllerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useMemo(makeParticles, []);
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
          uniform float uPixelRatio;

          void main() {
            vColor = color;
            vAlpha = alpha;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vColor, strength * vAlpha);
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
    const breathing = 1 + Math.sin(time * 1.5) * 0.05;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      
      // Calculate target position
      let target = particle.sphere.clone().multiplyScalar(breathing).lerp(particle.field, sphereToField);
      
      // Special focus for active panel
      if (particle.role && particle.role === activePanel) {
        target.lerp(CENTER, 0.9);
      }

      // Add slight drift to field particles
      if (sphereToField > 0.1) {
        target.x += Math.sin(time * 0.2 + particle.seed) * 0.2 * sphereToField;
        target.y += Math.cos(time * 0.2 + particle.seed) * 0.2 * sphereToField;
      }

      particle.current.lerp(target, 0.08);
      
      positions[index * 3] = particle.current.x;
      positions[index * 3 + 1] = particle.current.y;
      positions[index * 3 + 2] = particle.current.z;

      // Color and size adjustments
      const isActive = particle.role === activePanel;
      const isRole = !!particle.role;
      
      colors[index * 3] = particle.color.r;
      colors[index * 3 + 1] = particle.color.g;
      colors[index * 3 + 2] = particle.color.b;

      let size = particle.size;
      if (isActive) size *= 4;
      else if (isRole) size *= 1.5;
      
      sizes[index] = size;
      
      let alpha = particle.opacity * darkness;
      if (isActive) alpha = 1;
      else if (activePanel) alpha *= 0.2; // Dim others when panel is active
      
      alphas[index] = alpha;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
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
        <color attach="background" args={["#000000"]} />
        <CameraRig progress={props.progress} />
        <ParticleController {...props} />
      </Canvas>
    </div>
  );
}
