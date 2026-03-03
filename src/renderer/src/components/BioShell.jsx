/**
 * @PATH [src/renderer/src/components/BioShell.jsx]
 * @REV 20260303-0653
 * @MODULE [UI]
 * @STATUS [DEV]
 * @FILETYPE [CMP]
 * @DESC [3D Volumetric Render Engine - Zerg Biomass Variant]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Move GLSL strings to separate .glsl files loaded via Vite ?raw later
 * @TODO_END
 * =====================================*/

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudioEngine } from '../contexts/AudioEngineProvider'

// --- 3D Vertex Shader ---
// This handles the physical shape distortion
const vertexShader = `
  uniform float u_time;
  uniform float u_audio;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;

    // 1. Base Audio Expansion: Push the surface outward on bass hits
    float audioDisplacement = u_audio * 2.0; 
    
    // 2. Organic Noise: Make the surface boil and undulate even when quiet
    float noise = sin(position.x * 5.0 + u_time) 
                * sin(position.y * 5.0 + u_time) 
                * sin(position.z * 5.0 + u_time);
                
    float finalDisplacement = audioDisplacement + (noise * 0.2);

    // 3. Apply the math to the physical vertices
    vec3 newPosition = position + normal * finalDisplacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

// --- 3D Fragment Shader ---
// This handles the skin, colors, and shadows
const fragmentShader = `
  uniform float u_time;
  uniform float u_audio;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Zerg Biomass Palette
    vec3 darkMatter = vec3(0.05, 0.0, 0.02);
    vec3 fleshRed = vec3(0.8, 0.1, 0.1);
    vec3 bioEnergy = vec3(1.0, 0.6, 0.0); // Orange/Yellow spike on heavy hits

    // Fake 3D Lighting (Rim Light based on the camera angle)
    float rimLight = dot(vNormal, vec3(0.0, 0.0, 1.0));
    rimLight = max(rimLight, 0.2); // Add ambient minimum

    // Mix colors based on audio intensity
    vec3 finalColor = mix(darkMatter, fleshRed, u_audio * 2.5);
    
    // Flash bio-energy yellow on the hardest transients
    float spike = smoothstep(0.6, 1.0, u_audio);
    finalColor = mix(finalColor, bioEnergy, spike);

    gl_FragColor = vec4(finalColor * rimLight, 1.0);
  }
`

const ReactiveMesh = () => {
  const { getAnalyserNode, status } = useAudioEngine()
  const meshRef = useRef()
  const materialRef = useRef()
  
  const frequencyData = useMemo(() => new Uint8Array(1024), [])

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return

    // 1. Slowly rotate the entire 3D object so it feels alive
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2

    // 2. Update shader time uniform
    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime

    // 3. Audio Polling
    const analyser = getAnalyserNode()
    let audioIntensity = 0

    if (analyser && status === 'PLAYING') {
      analyser.getByteFrequencyData(frequencyData)
      
      let sum = 0
      for (let i = 0; i < 50; i++) { // Sample sub-bass and kick frequencies
        sum += frequencyData[i]
      }
      audioIntensity = (sum / 50) / 255.0
    }

    // 4. Inject into GPU
    materialRef.current.uniforms.u_audio.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_audio.value, 
      audioIntensity, 
      0.15 
    )
  })

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_audio: { value: 0 }
  }), [])

  return (
    <mesh ref={meshRef}>
      {/* Radius 2, Detail 64. 
        Higher detail = more triangles = smoother, organic morphing.
      */}
      <icosahedronGeometry args={[2, 64]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false} // Try setting this to true later for a crazy hologram vibe
        transparent={true}
      />
    </mesh>
  )
}

export default function BioShell() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      {/* Pulled the camera back slightly to frame the 3D sphere */}
      <Canvas camera={{ position: [0, 0, 7] }} gl={{ alpha: true, antialias: true }}>
        <ReactiveMesh />
      </Canvas>
    </div>
  )
}