# AuralisAudio: README
/**  
 * @PATH [README.md]  
 * @REV [20260303-0526]  
 * @MODULE [DOC]  
 * @CLASS [PUB]  
 * @STATUS [PLAN]  
 * @FILETYPE [UTL]  
 * @DESC [Master README for Auralis Audio Player Stress Test]  
 * -------------------------------------  
 * @TODO_START  
 * [!] Finalize specific GLSL shader string storage loading mechanism  
 * [*] Validate FFT bin size (2048) against mid-tier mobile GPU performance  
 * [:] Implement adaptive degradation thresholds (45 FPS)  
 * @TODO_END  
 * =====================================*/  

## Auralis Audio Player  
An isolated, local-first *Truth Engine* stress test for the **Adaptive Engine** (AE) architecture. This repository demonstrates a decoupled theming abstraction layer capable of hot-swapping between a standard DOM-based UI and a high-fidelity, frameless WebGL environment (The Shell) without disrupting the underlying audio state or data pipelines.  

### 1. System Architecture  

*The application utilizes Electron's multi-process architecture to enforce strict separation of concerns:*  
* **The Brain (Main Process):** Node.js environment. Handles recursive FS scanning, ID3 metadata extraction via music-metadata, and local JSON cache persistence.  
* **The Bridge (IPC):** A strictly asynchronous contextBridge contract. Facilitates deterministic data flow between the Node backend and the React renderer.  
* **The Body (Renderer):** React functional components. Manages volatile state via Context and executes the WebGL render loop via React Three Fiber (R3F).  

  #### IPC Bridge Contract  
  | Channel | Payload | Response | Purpose |
  | :--- | :--- | :--- | :--- |
  | `library:scan` | string (Path) | Object (Library) | Recursive ID3 parsing & relation mapping. |  
  | `library:loadCache` | None | Object (Library) | Boot-time hydration from library.json. |  
  | `window:setMode` | 'TRUTH', 'MINI' | boolean | "Toggles transparency, frames, and resizing." |  
  | `os:mediaControl` | Enum (Playback) | boolean | Native OS media key integration. |  

### 2. Sub-System Specifications  

  **A. Core Audio Engine (Headless)**  
  *Responsible for the audio lifecycle and data telemetry.*  
  * **Protocol:** Registers local-media:// to bypass CORS for local FS streaming.  
  * **Telemetry:** Configures AnalyserNode (FFT Size: 2048) for 1024-bin frequency extraction.  
  * **Transient Detection:** Computes RMS of low-frequency bins to provide an `isKick` boolean flag for real-time shader reactivity.  

  **B. Visual Render Engine (The Shell)**  
  *A high-performance WebGL layer built with three and @react-three/fiber.*  
  * **Zero-Lag Pipeline:** Bypasses React's reconciliation cycle by injecting FFT data directly into GLSL `<shaderMaterial>` uniforms within the useFrame loop.  
  * **Adaptive Degradation:** Monitors frame deltas; automatically disables post-processing (Bloom, Kuwahara) if performance dips below 45 FPS.  
  * **Skinning API:** Dynamically mounts JSON-configured skins using Vite's `?raw` import syntax for GLSL shader strings.  

### 3. Tech Stack & Constraints  

**Runtime:** Electron + React (Functional only).  
**WebGL:** Three.js, R3F, Drei, Post-processing.  
**State:** React Context + Hooks (No Redux).  
**Animations:** Framer Motion (DOM only), GLSL (GPU/Canvas).  

### 4. Compliance Rules  

**Zero-External-Icons:** All UI icons sourced from local library files.  
**Strict Cleanup:** Every `onSnapshot` or listener must be assigned to an `unsubscribe` variable and returned in `useEffect` cleanup.  
**Async/Await:** Prefer over `.then()` for all IPC and FS operations.  

### 5. Library Schema (library.json)  

```JSON 
{  
  "tracks": [{  
    "id": "uuid",  
    "title": "Parsed ID3",  
    "audioSrc": "local-media://path/to/file.mp3",  
    "metadata": { "artist": "", "album": "", "duration": 0 },  
    "coverArt": "base64/URI"  
  }],  
  "playlists": [{ "id": "uuid", "name": "Favorites", "trackIds": [] }]  
}
```

### 6. Development  

#### A. Install dependencies  
`npm install three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion music-metadata`  

#### B. Start development environment  
`npm run dev`

Modes  
* **Standard/Mini:** Rigid rectangular grid, standard DOM controls, GPU context dropped to save resources.  
* **Truth Mode:** Frameless, transparent, 60 FPS organic WebGL shell with full pointer-event pass-through.  

**An Electron application with React**  
#### Recommended IDE Setup  
- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)  

## Project Setup  

### Install  

```bash  
$ npm install  
```  

### Development  

```bash  
$ npm run dev  
```  

### Build  

```bash  
# For windows  
$ npm run build:win  

# For macOS  
$ npm run build:mac  

# For Linux  
$ npm run build:linux  
```  
