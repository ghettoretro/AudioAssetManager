# AuralisAudio: [PRD]_CORE_AUDIO_ENGINE_V1
/**
 * @PATH [design/[PRD]_CORE_AUDIO_ENGINE_V1.md]
 * @REV [20260303-0140]
 * @MODULE [AURALIS]
 * @CLASS [INT]
 * @STATUS [WIP]
 * @FILETYPE [PRD]
 * @DESC [Core Audio Engine API and IPC Architecture Specification]
 * -------------------------------------
 * @TODO_START
 * [*] Define specific Node.js ID3 parsing library for Main process
 * @TODO_END
 * =====================================*/

## Architectural Overview
This specification defines the Core Audio Engine. It operates as a headless data provider. Its sole responsibility is securely reading local audio files, maintaining playback state, extracting ID3 metadata, and piping raw Fast Fourier Transform (FFT) data to the rendering layer. It has zero knowledge of the visual UI.

## Electron Main Process & I/O
* **Custom Media Protocol:** Register a custom scheme (e.g., local-media://) to bypass Chromium CORS restrictions, allowing the React frontend to natively fetch() or stream absolute OS file paths directly into the Web Audio API.
* **Directory Management:** Recursive directory scanning via Node.js fs.
* **Metadata Extraction:** Node.js process to extract ID3 tags (Title, Artist, Album, base64 Artwork) prior to passing data to the frontend to prevent main-thread blocking in React.
* **Cache Persistence:** Local storage of scanned TrackObject arrays (via JSON) to prevent rescanning directories on boot.

## The Web Audio API Pipeline (Renderer)  
* Initialization: Singleton AudioContext instantiated on user interaction.  
* Source Routing: Audio buffered and routed through standard nodes (MediaElementAudioSourceNode or AudioBufferSourceNode depending on latency requirements for shaders).  
* The Analyzer Bridge: AnalyserNode explicitly configured for high-fidelity extraction.  
    `fftSize` configured to a baseline of 2048 (providing 1024 frequency bins).  
    `smoothingTimeConstant` tuned to ensure transient preservation (e.g., 0.8).  
* **Transient Extraction Logic:** A utility function running parallel to the FFT extraction that calculates the Root Mean Square (RMS) of the low-frequency bins to flag kick/bass impacts as a boolean (isKick) for the shaders.

## Library Cache (library.json)
Persisted to disk. Relational mapping is executed by the Node.js Main process to prevent frontend blocking.

```JSON

{
  "tracks": [{
    "id": "", // String, UUID or hashed absolute path
    "title": "", // String, Parsed from ID3, fallback to filename
    "artist": "", // String
    "album": "", // String
    "genre": [], // Array of Strings
    "duration": 0, // Number (Float, seconds)
    "audioSrc": "", // String, Absolute local OS path
    "coverArt": "", // String, Base64 string or local cache URI
    "energyTag": "" // String, Optional pre-computed analysis tag
  }],
  "albums": [{
    "id": "", // String, UUID or hashed absolute path
    "title": "", // String
    "artist": "", // String
    "year": "", // String
    "coverArt": "", // String, Base64 string or local cache URI
    "trackIds": [] // Array of Strings
  }],
  "artists": [{
    "id": "", // String, UUID
    "name": "", // String
    "albumIds": [] // Array of Strings
  }],
  "playlists": [{
    "id": "", // String, UUID
    "name": "", // String
    "trackIds": [] // Array of Strings
  }]
}
```

## User Preferences (preferences.json)
Isolated from the library cache to ensure user settings are preserved even if the library cache is forcefully purged or rebuilt.

```JSON
{
  "settings": {
    "scanDirectories": [], // Array of Strings ["/music"]
    "supportedFormats": [], // Array of Strings ["mp3", "flac", "wav"]
    "theme": "", // String, e.g., "dark"
    "language": "" // String, e.g., "en-US"
  }
}
```

## Playback State (Volatile React Context)
Strictly in-memory state. Maintained in React via Context/Reducer, consumed by UI controllers. Never written to disk.

```JSON
{
  "playbackState": {
    "status": "", // Enum ('IDLE', 'PLAYING', 'PAUSED', 'BUFFERING')
    "currentTrack": null, // TrackObject | null
    "progress": 0, // Number (Float, current time in seconds)
    "volume": 1.0, // Number (Float, 0.0 to 1.0)
    "queue": [], // Array of TrackObjects
    "queuePosition": 0, // Number (Integer)
    "mode": "" // Enum ('NORMAL', 'SHUFFLE', 'LOOP_TRACK', 'LOOP_ALL')
  }
}
```

## IPC Bridge Contract (Async/Await)
*Exposed via Electron's contextBridge to maintain strict async/await patterns in React.*

| Channel | React Payload | Electron Response | Purpose |
| :--- | :--- | :--- | :--- |
| `system:selectDir` | None | String (Path) | Opens native OS folder picker. |
| `library:scan` | String (Path) | Object `<LibraryPayload>` | "Scans directory, parses ID3, maps relations, returns full library.json object." |
| `library:loadCache` | None | Object `<LibraryPayload>` | Loads previous library state from library.json on application boot. |
| `settings:load` | None | Object `<SettingsPayload>` | Loads user preferences from preferences.json. |
| `settings:save` | Object `<SettingsPayload>` | Boolean | Saves updated preferences to preferences.json. |
| `os:mediaControl` | Enum ('PLAY', 'PAUSE') | Boolean | Broadcasts state to OS-level media keys/lock screen. |
| `window:setMode` | Enum ('TRUTH', 'MINI') | Boolean | Instructs Electron to resize window and toggle transparency. |
