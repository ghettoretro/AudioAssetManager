/**
 * @PATH [src/AudioController.jsx]
 * @REV [20260225-0140]
 * @MODULE [PRT]
 * @STATUS [DEV]
 * @FILETYPE [WDG]
 * @DESC [Master controller for Bio-UI and Web Audio integration.]
 * @COMPLIANCE [Functional React; async/await]
 * -------------------------------------
 * @TODO_START
 * [?] Add playback controls (next/prev track) once playlist array is implemented
 * @TODO_END
 * =====================================*/

import { useRef } from 'react'
import BioShell from './BioShell'
import { useAudioPulse } from './useAudioPulse';

// @COMPONENT
const AudioController = ({ trackSrc }) => {
  // @REFS
  const audioRef = useRef(null);
  
  // @CONTEXT
  const { initAudio, getPulse, isPlaying, setIsPlaying } = useAudioPulse();

  // @HANDLERS
  const handlePlayPause = async () => {
    await initAudio(audioRef.current);

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      
      {/* Invisible SVG definition for the irregular masking */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="bio-mask" clipPathUnits="objectBoundingBox">
            <path d="M0.1,0.2 C0.05,0.4 0,0.5 0.05,0.7 C0.1,0.9 0.3,1 0.5,0.95 C0.7,0.9 0.95,0.85 0.98,0.6 C1,0.35 0.9,0.1 0.7,0.05 C0.5,0 0.2,0.1 0.1,0.2" />
          </clipPath>
        </defs>
      </svg>

      {/* Main Container utilizing the clip-path */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '300px', // Scaled height for the sidebar
        clipPath: 'url(#bio-mask)', 
        overflow: 'hidden' 
      }}>
        
        {/* 1. The "Bio-Skin" Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <BioShell getPulse={getPulse} />
        </div>

        {/* 2. The Control Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            onClick={handlePlayPause}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(0, 255, 200, 0.4)',
              color: '#00ffc8',
              padding: '16px 32px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              transition: 'all 0.3s ease'
            }}
          >
            {isPlaying ? 'Dormant' : 'Awaken'}
          </button>
        </div>

        {/* 3. The Hidden Audio Engine */}
        <audio 
          ref={audioRef} 
          src={trackSrc} 
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous" 
        />
      </div>
    </div>
  );
};

export default AudioController;