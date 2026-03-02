/**
 * @PATH [docs/02_design/[SPC]_PRD2_VISUAL_RENDER_ENGINE.md]
 * @REV 20260302-0552
 * @MODULE [COM]
 * @STATUS [PLAN]
 * @FILETYPE [SPC]
 * @DESC [Visual Render Engine (The Bio-Shell) API and Architecture Specification]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Define specific GLSL shader string storage and loading mechanism
 * [?] Confirm performance overhead of Kuwahara filter on lower-end GPUs
 * @TODO_END
 * =====================================*/

## 1. The Architectural Pillars
* **Irregular Silhouette:** Break the "rectangular container" mental model. If the outer boundary isn't a 90° box, the brain stops seeing "software" and starts seeing "object." Irregular silhouettes and soft edges sell the effect more than texture detail.
* **Implementation:** Use SVG `mask-image` or `clip-path` for the root container.
* **Soft Boundary Integration:** Use alpha-feathered edges and inner glows to eliminate the "box sitting on a desktop" feel. This hides aliasing and anchors the UI into the OS environment.
* **Anatomical Lighting:** Eschew flat textures for layered highlights and inner shadows that follow the irregular contour. This creates a "gel-like" or "biological" volume without high-poly 3D modeling.

## 2. R3F Canvas & Environment Architecture
* **Frameless Initialization:** `<Canvas>` configured with `alpha: true` and `antialias: false` (to allow custom post-processing antialiasing). Electron window configured as `transparent: true`, `frame: false`.
* **Camera Setup:** Orthographic camera for 2D/UI-focused skins (e.g., Van Gogh impasto), or Perspective camera for 3D volumetric skins (e.g., Zerg shell).
* **Event Layering:** CSS `pointer-events` management to ensure clicks on the "transparent" parts of the Electron window fall through to the desktop, while the opaque GLSL mesh registers standard React `onClick` events.

## 3. The Data Bridge & Mapping Logic (useFrame Pipeline)
*To make the UI "Bio-Reactive" and ensure it scales, you cannot rely on simple CSS transitions. You need a high-performance bridge.*
* **The Audio Hook:** A custom hook (e.g., `useAudioSync`) that pulls the `AnalyzerData` (FFT array, transient flags) from the PRD 1 context.
* **Frequency Analysis:** Use the Web Audio API (`AnalyserNode`) to extract `frequencyBinCount`. The Fast Fourier Transform (FFT) provides the raw data array (0-255) for bass, mids, and treble.
* **The Uniform Injection:** The `useFrame` loop writes the FFT array, `uTime` (for idle animation), and `uResolution` directly into a `useRef` pointing to the active `<shaderMaterial>` uniforms. This strictly bypasses React component re-renders. Passing the FFT data as a Uniform into a GLSL Shader allows the shell to ripple, glow, or distort in real-time with zero CPU lag.

## 4. The Skinning API (Material Hot-Swapping)
* **Skin Configuration Payload:** A JSON standard defining a skin's requirements.
  * `id`: String.
  * `type`: Enum ('2D_SHADER', '3D_MESH').
  * `shaders`: Object containing base64 encoded or raw string Vertex and Fragment GLSL code.
  * `textures`: Array of required assets (e.g., Normal Maps, Flow Maps).
* **Dynamic Material Mounting:** A functional React component that parses the active skin JSON, pre-loads textures via R3F's `useTexture`, and mounts the appropriate `<shaderMaterial>`. Unmounting instantly purges the old WebGL programs from GPU memory.

## 5. The Render Pipeline (Post-Processing Stack)
* **Effect Composer:** Utilizing `@react-three/postprocessing` to handle universal visual polish.
* **Conditional Passes:** * **Zerg Skin:** Triggers `<Bloom>` and `<ChromaticAberration>`.
  * **Van Gogh Skin:** Triggers a custom Kuwahara filter pass and `<Noise>`.

## 6. Skin Profiles & Visual Layers
*Three.js / React Three Fiber is the "Professional" route for executing these visual layers.*

### The "Zerg/Giger" Evolution (WebGL + Audio)
*For a high-fidelity "living" UI, move beyond DOM/CSS into GLSL Shaders and the Web Audio API.*
* **Logic:** Map `AnalyserNode` frequency data to shader uniforms. The "veins" or "plates" of the UI should physically react to the bass/transients.
* **The "Creep" (Reaction-Diffusion):** Use mathematical models in a fragment shader to let the UI "grow" or "recede" based on data input or user focus.
* **Bioluminescence:** Implement a post-processing bloom pass on specific "veins" to create a rhythmic pulse while the engine is processing.
* **Precision vs. Organic:** Keep text and controls high-contrast and clean. The "bio" is the container; the "data" remains readable.

### The "Bio-Skin" Recipe
* **Base:** Root shell defined by an irregular SVG/CSS mask.
* **Edge:** Blurred mask or outer glow for a soft transition.
* **Lighting:** Two CSS/Shader layers:
  * A slow, low-amplitude highlight sweep (surface sheen).
  * A gentle pulsing "breath" (opacity/scale shifts).
* **Detail:** 5–10% opacity noise or "vein" texture overlay.

### Alternative Styles
* **Painterly UI (Van Gogh/Monet):** These are “material-based” (texture, gesture, depth) and fundamentally fight DOM assumptions. True painterly UI requires canvas/WebGL or a rendering layer, not just Tailwind components.
* **Graphic UI (Hokusai):** Flat, geometric styles map naturally to DOM/CSS and are practical.
* **Topographic/Elevation Backgrounds:** Typically implemented as SVG contour paths. Canvas/WebGL only needed if animated or procedural.

## 7. UX/UI States & Viewports
* **The "Breathing" Fallback:** GLSL logic utilizing `mix(uTime * sineWave, fftData)` to ensure continuous fluid motion during playback pauses or silent track intros.
* **The Mini-Player Toggle:** Triggers a state flip (`isTruthMode: false`).
  * Completely unmounts the R3F `<Canvas>` component to release GPU context.
  * Fires IPC payload to Electron: `window:resizeToMini` (snaps to a rigid, standard rectangular grid layout, drops transparency).

---

## 8. Longview Goal & Integration Context
**The Alpha Test:** If you can’t get a simple GLSL sphere to pulse rhythmically to a frequency range in React, the Hivemind implementation will indeed be too heavy. 

**Comparison: UI Skins Strategy**
| Aspect | Skin 1: "Archaic/Mechanical" | Skin 2: "Bioluminescent/Organic" |
| :--- | :--- | :--- |
| **Visual Focus** | Gear ratios, brass, ticking, pressure gauges. | Fluid dynamics, neural pulses, soft glow. |
| **Mapping Tech** | FFT Bass -> Gear rotation speed. | FFT Mids/Highs -> Shader displacement (ripples). |
| **Framer Role** | Layout transitions and tactile "clicks." | Organic "breathing" loops. |
