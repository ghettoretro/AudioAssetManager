# AdaptiveEngine: [PRD]_AURALIS_AUDIO_PLAYER_V1
/**
 * @PATH [design/[PRD]_AURALIS_AUDIO_PLAYER_V1.md]
 * @REV [20260303-0152]
 * @MODULE [AURALIS]
 * @CLASS [INT]
 * @STATUS [PLAN]
 * @FILETYPE [PRD]
 * @DESC [Master Synthesis: Auralis Audio Player & Adaptive Engine Stress Test]
 * -------------------------------------
 * @TODO_START
 * [!|?|*|+|-|&|$|:]
 * @TODO_END
 * =====================================*/

Auralis

## 1. Executive Summary & Objective
This project is an isolated, local-first audio player application built to serve as a "Truth Engine" stress test for the Adaptive Engine (AE) architecture.
**Primary Objective:** To prove that the AE theming abstraction layer is fully decoupled. The system must seamlessly transition from a standard, rigid, DOM-based rectangular grid (Mini/Standard Mode) to a highly complex, frameless, 60 FPS WebGL-driven organic interface (Truth Mode) without altering the underlying data or state pipelines.

## 2. Global Architecture
The application strictly enforces a separation of concerns using the Electron architecture:
* **The Brain (Node.js Main Process):** Handles file system I/O, ID3 metadata extraction, OS-level media integrations, and local SQLite/JSON caching.
* **The Bridge (Electron IPC):** A strictly asynchronous contract (`contextBridge`) passing deterministic data payloads between the backend and the frontend.
* **The Body (React/WebGL Renderer):** Consumes the IPC payloads and the Web Audio API FFT data. It is completely stateless regarding file management and purely reactive to the data feeds.

## 3. Sub-System Specifications
This master document governs two explicitly isolated sub-systems.

### A. Core Audio Engine (PRD 1)
* **Role:** The headless data provider.
* **Responsibilities:** * Securely route local `file://` protocols into the `AudioContext`.
    * Expose a high-fidelity `AnalyserNode` for 1024-bin Fast Fourier Transform (FFT) extraction.
    * Manage all volatile playback state (Queue, Progress, Volume) within a React Context.
    * Maintain the persisted relational database (Tracks, Albums, Artists, Playlists).

### B. Visual Render Engine (PRD 2)
* **Role:** The WebGL consumer and OS window manipulator.
* **Responsibilities:**
    * Maintain the frameless, transparent React Three Fiber (`<Canvas>`) environment.
    * Execute the `useFrame` loop to pipe FFT data directly into active GLSL `<shaderMaterial>` uniforms, bypassing React render cycles.
    * Manage the dynamic mounting/unmounting of JSON-configured "Skins" (e.g., Zerg volumetric mesh, Van Gogh Kuwahara filter).
    * Handle adaptive degradation (dropping post-processing passes if FPS falls below 45).

## 4. Key Workflows & State Transitions
* **Library Ingestion:** User selects directory -> Node.js recursively scans -> `music-metadata` extracts ID3 -> Main process maps relational JSON -> IPC pushes to React -> Cache saved to disk.
* **Audio-Visual Sync:** React selects track -> `AudioContext` streams file -> `AnalyserNode` extracts FFT -> R3F `useFrame` pipes array to GPU -> GLSL vertex/fragment shaders deform and paint pixels at 60 FPS.
* **Mode Swapping (Mini vs. Truth):** * *Mini Mode:* Electron window locks to standard rectangle, DOM mounts standard UI controls, WebGL `<Canvas>` unmounts, GPU context drops.
    * *Truth Mode:* Electron window goes frameless/transparent, `<Canvas>` mounts, WebGL context initializes, DOM UI falls back to pointer-events pass-through.

## 5. Technology Stack constraints
* **Framework:** Electron + React (Functional Components only).
* **Build Tool:** `electron-vite`.
* **WebGL Layer:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`.
* **Metadata:** `music-metadata`.
* **State / UI:** React Context + Hooks. Framer Motion for DOM-level transitions only.
* **Rule Enforcement:** Zero tolerance for un-audited `useEffect` dependencies; rigorous cleanup required for all listeners and AudioContext nodes to prevent memory leaks and zombie processes.

## 6. Success Criteria
1. **Zero-Latency Sync:** Visual deformations (e.g., Zerg shell pulses) perfectly align with audio transients with no perceptible delay.
2. **Uninterrupted Playback:** Switching between Mini Mode and Truth Mode (unmounting the WebGL canvas) does not interrupt the audio stream or cause stuttering.
3. **Performant Baseline:** Application maintains 60 FPS in Truth Mode on mid-tier hardware; gracefully degrades effects to preserve audio sync on lower-end hardware.
4.  

---

# AdaptiveEngine: [PRD]_LOCAL_MUSIC_PLAYER_V1
/**
 * @PATH [design/[PRD]_LOCAL_MUSIC_PLAYER_V1.md]
 * @REV [20260303-0140]
 * @MODULE [DOC]
 * @CLASS [INT]
 * @STATUS [WIP]
 * @FILETYPE [PRD]
 * @DESC [Project overview of the Local Music Player App.]
 * -------------------------------------
 * @TODO_START
 * [!|?|*|+|-|&|$|:]
 * @TODO_END
 * =====================================*/

## Overview of Project
This is to test out the execution of a prototype music player.

## Compliance Requirements

 * No external icon packs
 * Functional React
 * async/await
 * native `<audio>`
 * strict useEffect cleanup applied

## Core Feature Requirements
* Music Playback: Play audio files from the device's local storage.
* Playlist Creation: Allow users to create and manage custom playlists.
* File Browsing: Browse the device's storage to select music files and add them to the library.
* Search Functionality: Enable users to quickly find songs, artists, or albums within their music library.
* Metadata Display: Display song metadata, such as title, artist, album, and cover art.
* Background Playback: Continue playing music even when the app is minimized or the screen is off.

## Style Guidelines (Mini-Player)
* Primary color: TBD
* Background color: TBD
* Accent color: TBD
* Body and headline font: TBD
* Use modern, flat icons for navigation and controls.
* Implement a clean, intuitive layout for easy navigation.
* Subtle animations on track transition and play/pause actions.

## Build & Core Framework (Dev Dependencies)

* **electron:** The Chromium/Node wrapper.
* **electron-vite:** The bundler (compiles Main and Renderer processes simultaneously).
* **vite & @vitejs/plugin-react:** The dev server and React compiler.

## Main Process: Core Audio Engine (Dependencies)
*These run exclusively in the Node.js backend.*
* **music-metadata:** The industry standard (MIT) for extracting ID3 tags, album art, and durations accurately without loading the entire audio buffer into memory.
**Note on local cache:** We can use native Node.js fs to read/write the JSON library cache. No external DB package (like SQLite) is strictly necessary for v1 unless the track count exceeds ~50,000 files, at which point JSON parsing becomes a memory bottleneck.

## Renderer Process: Visual Render Engine (Dependencies)
*These run exclusively in the React frontend.*
* **react & react-dom:** (Functional components only).
* **three:** The core WebGL engine.
* **@react-three/fiber:** The React reconciler for Three.js (allows us to write WebGL as functional React components).
* **@react-three/drei:** Core utility helpers for R3F (specifically useful for camera controls and pre-loading textures/shaders).
* **@react-three/postprocessing:** The effect composer required for the Bloom, Noise, and custom Kuwahara filter passes.
* **framer-motion:** Handled via standard DOM nodes for the "Mini Player" state transitions and strictly standard UI overlay elements.

Initialization Command
If you are bootstrapping from scratch, the standard initialization command handles the boilerplate directory structure (Main, Preload, Renderer):
npm create @quick-start/electron my-audio-player -- --template react

✔ Add TypeScript? … No
✔ Add Electron updater plugin? … Yes
✔ Enable Electron download mirror proxy? … Yes

  cd my-audio-player
  npm install
  npm run dev

npm warn Unknown project config "electron_mirror". This will stop working in the next major version of npm.
npm warn Unknown project config "electron_builder_binaries_mirror". This will stop working in the next major version of npm.
npm warn deprecated rimraf@2.6.3: Rimraf versions prior to v4 are no longer supported
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting <i@izs.me>
npm warn deprecated boolean@3.2.0: Package no longer supported. Contact Support at <https://www.npmjs.com/support> for more info.
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting <i@izs.me>

> my-audio-player@1.0.0 postinstall
> electron-builder install-app-deps

  • electron-builder  version=26.8.1
  • loaded configuration  file=/workspaces/AudioAssetManager/my-audio-player/electron-builder.yml
  • executing @electron/rebuild  electronVersion=39.7.0 arch=x64 buildFromSource=false workspaceRoot=/workspaces/AudioAssetManager/my-audio-player projectDir=./ appDir=./
  • installing native dependencies  arch=x64
  • completed installing native dependencies

Following that, the installation of our specific runtime stack:
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion music-metadata

Legacy Files
[BioShell.jsx]
 * Renders a reactive, organic UI shell using twgl.js and GLSL. Uses a basic 'pulsing' noise. To integrate with AE, pass AnalyserNode data as a uniform.

[useAudioPulse.js]
 * Manages Web Audio API lifecycle and extracts real-time amplitude data.

[AudioController.jsx]
 * Master controller for Bio-UI and Web Audio integration.

[SidebarMusicPlayer.jsx]
 * Native HTML5 audio player with local folder playback and advanced playback controls.

[AudioAssetManager.jsx]
 * Manages the viewing, playback, and deletion of audio assets that have been ingested into the system.

## 8. Longview Goal & Integration Context
**The Alpha Test:** If you can’t get a simple GLSL sphere to pulse rhythmically to a frequency range in React, the Hivemind implementation will indeed be too heavy.

**Comparison: UI Skins Strategy**

| Aspect | Skin 1: "Archaic/Mechanical" | Skin 2: "Bioluminescent/Organic" |
| :--- | :--- | :--- |
| **Visual Focus** | Gear ratios, brass, ticking, pressure gauges. | Fluid dynamics, neural pulses, soft glow. |
| **Mapping Tech** | FFT Bass -> Gear rotation speed. | FFT Mids/Highs -> Shader displacement (ripples). |
| **Framer Role** | Layout transitions and tactile "clicks." | Organic "breathing" loops. |
