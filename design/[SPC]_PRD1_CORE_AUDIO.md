/**
 * @PATH [design/[SPC]_PRD1_CORE_AUDIO.md]
 * @REV 20260302-0509
 * @MODULE [COM]
 * @STATUS [PLAN]
 * @FILETYPE [SPC]
 * @DESC [Core Audio Engine API and IPC Architecture Specification]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Define specific Node.js ID3 parsing library for Main process
 * [?] Confirm SQLite vs JSON for local library cache persistence
 * @TODO_END
 * =====================================*/

## Architectural Overview
This specification defines the Core Audio Engine. It operates as a headless data provider. Its sole responsibility is securely reading local audio files, maintaining playback state, extracting ID3 metadata, and piping raw Fast Fourier Transform (FFT) data to the rendering layer. It has zero knowledge of the visual UI.

## Electron Main Process & I/O
* Custom Media Protocol: Register a custom scheme (e.g., local-media://) to bypass Chromium CORS restrictions, allowing the React frontend to natively fetch() or stream absolute OS file paths directly into the Web Audio API.
* Directory Management: Recursive directory scanning via Node.js fs.
* Metadata Extraction: Node.js process to extract ID3 tags (Title, Artist, Album, base64 Artwork) prior to passing data to the frontend to prevent main-thread blocking in React.
* Cache Persistence: Local storage of scanned TrackObject arrays (via JSON or SQLite) to prevent rescanning directories on boot.

## The Web Audio API Pipeline (Renderer)
* Initialization: Singleton AudioContext instantiated on user interaction.
* Source Routing: Audio buffered and routed through standard nodes (MediaElementAudioSourceNode or AudioBufferSourceNode depending on latency requirements for shaders).
* The Analyzer Bridge: * AnalyserNode explicitly configured for high-fidelity extraction.

fftSize configured to a baseline of 2048 (providing 1024 frequency bins).

smoothingTimeConstant tuned to ensure transient preservation (e.g., 0.8).

* Transient Extraction Logic: A utility function running parallel to the FFT extraction that calculates the Root Mean Square (RMS) of the low-frequency bins to flag kick/bass impacts as a boolean (isKick) for the shaders.

## Data Models (Static Context)

### TrackObject
* id: String (UUID or hashed absolute path)
* filePath: String (Absolute local OS path)
* title: String (Parsed from ID3, fallback to filename)
* artist: String
* album: String
* duration: Number (Float, seconds)
* artwork: String (Base64 string or local cache URI)
* energyTag: String (Optional pre-computed analysis tag: 'high', 'low', 'aggressive')

### PlaylistObject
* id: String
* name: String
* trackIds: Array of Strings

## Playback State (Volatile React Context)
Maintained in React via Context/Reducer, consumed by UI controllers.

* status: Enum ('IDLE', 'PLAYING', 'PAUSED', 'BUFFERING')
* currentTrack: TrackObject | null
* progress: Number (Float, current time in seconds)
* volume: Number (Float, 0.0 to 1.0)
* queue: Array of TrackObjects
* queuePosition: Number (Integer)
* mode: Enum ('NORMAL', 'SHUFFLE', 'LOOP_TRACK', 'LOOP_ALL')

## IPC Bridge Contract (Async/Await)
Exposed via Electron's contextBridge to maintain strict async/await patterns in React.
| Channel | React Payload | Electron Response | Purpose |
| system:selectDir | None | String (Path) | Opens native OS folder picker. |
| library:scan | String (Path) | Array <TrackObject> | Scans directory, parses ID3, returns array. |
| library:loadCache | None | Array <TrackObject> | Loads previous library state on application boot. |
| os:mediaControl | Enum ('PLAY', 'PAUSE') | Boolean | Broadcasts state to OS-level media keys/lock screen. |
| window:setMode | Enum ('TRUTH', 'MINI') | Boolean | Instructs Electron to resize window and toggle transparency. |


1. Build & Core Framework (Dev Dependencies)
electron: The Chromium/Node wrapper.

electron-vite: The bundler (compiles Main and Renderer processes simultaneously).

vite & @vitejs/plugin-react: The dev server and React compiler.

2. Main Process: Core Audio Engine (Dependencies)
These run exclusively in the Node.js backend.

music-metadata: The industry standard (MIT) for extracting ID3 tags, album art, and durations accurately without loading the entire audio buffer into memory.

Note on local cache: We can use native Node.js fs to read/write the JSON library cache. No external DB package (like SQLite) is strictly necessary for v1 unless the track count exceeds ~50,000 files, at which point JSON parsing becomes a memory bottleneck.

3. Renderer Process: Visual Render Engine (Dependencies)
These run exclusively in the React frontend.

react & react-dom: (Functional components only).

three: The core WebGL engine.

@react-three/fiber: The React reconciler for Three.js (allows us to write WebGL as functional React components).

@react-three/drei: Core utility helpers for R3F (specifically useful for camera controls and pre-loading textures/shaders).

@react-three/postprocessing: The effect composer required for the Bloom, Noise, and custom Kuwahara filter passes.

framer-motion: Handled via standard DOM nodes for the "Mini Player" state transitions and strictly standard UI overlay elements.

Initialization Command
If you are bootstrapping from scratch, the standard initialization command handles the boilerplate directory structure (Main, Preload, Renderer):
npm create @quick-start/electron my-audio-player -- --template react

Following that, the installation of our specific runtime stack:
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion music-metadata