/**
 * @PATH [src/renderer/src/components/ui/TrackList.jsx]
 * @REV 20260303-0640
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [CMP]
 * @DESC [Unified Track List UI consuming CSS variables]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

import { useLibrary } from '../../contexts/LibraryProvider'
import { useAudioEngine } from '../../contexts/AudioEngineProvider'
import { PlayIcon, PauseIcon } from './IconLibrary'

export default function TrackList() {
  const { tracks, isScanning } = useLibrary()
  const { playTrack, togglePlayback, status, currentTrack } = useAudioEngine()

  if (isScanning) {
    return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Scanning OS Directory...</div>
  }

  if (tracks.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>No tracks loaded. Select a directory.</div>
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px',
      overflowY: 'auto',
      paddingRight: '10px'
    }}>
      {tracks.map(track => {
        const isCurrent = currentTrack?.id === track.id
        const isPlaying = isCurrent && status === 'PLAYING'

        return (
          <div 
            key={track.id}
            onClick={() => isCurrent ? togglePlayback() : playTrack(track)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: isCurrent ? 'var(--accent-main)' : 'var(--bg-panel)',
              color: isCurrent ? '#000' : 'var(--text-primary)', // Assuming high contrast on active accent
              borderRadius: 'var(--border-radius)',
              border: `var(--border-width) solid var(--border-color)`,
              backdropFilter: `blur(var(--backdrop-blur))`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <span style={{ 
                fontWeight: isCurrent ? 'bold' : 'normal',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {track.title}
              </span>
              <span style={{ 
                fontSize: '0.8em', 
                color: isCurrent ? 'rgba(0,0,0,0.7)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis'
              }}>
                {track.artist}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}