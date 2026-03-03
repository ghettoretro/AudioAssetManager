/**
 * @PATH [src/renderer/src/components/ui/PlayerBar.jsx]
 * @REV 20260303-0640
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [CMP]
 * @DESC [Unified Player Controls consuming CSS variables]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Wire up actual progress bar scrubbing logic
 * @TODO_END
 * =====================================*/

import { useAudioEngine } from '../../contexts/AudioEngineProvider'
import { PlayIcon, PauseIcon, NextIcon, PrevIcon } from './IconLibrary'

export default function PlayerBar() {
  const { togglePlayback, status, currentTrack, progress } = useAudioEngine()

  // Scaffold format function for seconds -> mm:ss
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Calculate percentage for the visual progress bar
  const duration = currentTrack?.duration || 1
  const progressPercent = (progress / duration) * 100

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-panel)',
      borderRadius: 'var(--border-radius)',
      border: `var(--border-width) solid var(--border-color)`,
      backdropFilter: `blur(var(--backdrop-blur))`,
      padding: '15px',
      gap: '15px',
      fontFamily: 'var(--font-family)',
      WebkitAppRegion: 'no-drag' // CRITICAL: So users can click buttons
    }}>
      
      {/* Top Row: Track Info & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Track Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingRight: '20px' }}>
          <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentTrack ? currentTrack.title : 'No Track Selected'}
          </strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentTrack ? currentTrack.artist : '---'}
          </span>
        </div>

        {/* Transport Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button style={buttonStyle} disabled={!currentTrack}><PrevIcon /></button>
          
          <button 
            onClick={togglePlayback} 
            disabled={!currentTrack}
            style={{ ...buttonStyle, background: 'var(--accent-main)', color: '#000', width: '40px', height: '40px' }}
          >
            {status === 'PLAYING' ? <PauseIcon /> : <PlayIcon />}
          </button>
          
          <button style={buttonStyle} disabled={!currentTrack}><NextIcon /></button>
        </div>
        
      </div>

      {/* Bottom Row: Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75em', color: 'var(--text-secondary)' }}>
        <span>{formatTime(progress)}</span>
        
        <div style={{ flex: 1, height: '4px', background: 'var(--bg-control)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'var(--accent-main)',
            transition: 'width 0.1s linear'
          }} />
        </div>
        
        <span>{formatTime(currentTrack?.duration)}</span>
      </div>

    </div>
  )
}

// Shared button styling logic
const buttonStyle = {
  background: 'var(--bg-control)',
  color: 'var(--text-primary)',
  border: 'none',
  borderRadius: 'var(--border-radius)',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s ease'
}