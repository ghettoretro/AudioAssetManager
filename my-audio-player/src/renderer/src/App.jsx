/**
 * @PATH [src/renderer/src/App.jsx]
 * @REV 20260303-0257
 * @MODULE [UI]
 * @STATUS [DEV]
 * @FILETYPE [CMP]
 * @DESC [Brutalist Test Harness for Audio Pipeline Verification]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Replace with actual layout architecture once pipeline is verified
 * @TODO_END
 * =====================================*/

import { useLibrary } from './contexts/LibraryProvider'
import { useAudioEngine } from './contexts/AudioEngineProvider'

export default function App() {
  const { tracks, isScanning, scanDirectory } = useLibrary()
  const { playTrack, togglePlayback, status, currentTrack } = useAudioEngine()

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        minHeight: '100vh',
        background: '#121212'
      }}
    >
      <h1>AdaptiveEngine: Audio Pipeline Alpha</h1>

      {/* --- Controls --- */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={scanDirectory}
          disabled={isScanning}
          style={{
            padding: '10px',
            background: isScanning ? '#555' : '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isScanning ? 'Scanning OS...' : 'Select Music Folder'}
        </button>

        <button
          onClick={togglePlayback}
          disabled={!currentTrack}
          style={{
            padding: '10px',
            background: !currentTrack ? '#555' : '#28a745',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {status === 'PLAYING' ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* --- Status Bar --- */}
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#1e1e1e',
          border: '1px solid #333'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0' }}>
          Now Playing: {currentTrack ? currentTrack.title : 'None'}
        </h3>
        <p style={{ margin: 0 }}>
          State: <strong>{status}</strong>
        </p>
      </div>

      {/* --- Track Grid --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {tracks.length === 0 && !isScanning && <p>No tracks loaded. Scan a directory.</p>}

        {tracks.map((track) => (
          <div
            key={track.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              background: currentTrack?.id === track.id ? '#2a2a2a' : '#1e1e1e',
              border: '1px solid #333'
            }}
          >
            <div>
              <strong style={{ display: 'block' }}>{track.title}</strong>
              <span style={{ fontSize: '0.8em', color: '#aaa' }}>
                {track.artist} | {track.album}
              </span>
            </div>
            <button
              onClick={() => playTrack(track)}
              style={{
                padding: '5px 15px',
                background: '#444',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
