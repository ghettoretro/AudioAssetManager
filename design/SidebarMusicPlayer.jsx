/**
 * @PATH [src/components/audio/SidebarMusicPlayer.jsx]
 * @REV [20260225-0814]
 * @MODULE [OS]
 * @STATUS [DEV]
 * @FILETYPE [WDG]
 * @DESC [Native HTML5 audio player with local folder playback and advanced playback controls.]
 * @COMPLIANCE [Functional React; native <audio>; strict useEffect cleanup applied]
 * -------------------------------------
 * @TODO_START
 * [?] Add a playlist drawer/view to see upcoming tracks
 * [?] Wire onlinePlaylist to Firestore/Firebase Storage URLs
 * [?] need a persistent player, see if it can collapse into the header somewhere
 * @TODO_END
 * =====================================*/

import { useState, useRef, useEffect, useCallback } from 'react';

import { Icon } from '../ui/icons';
import { Toggle } from '../ui/Toggle'; 

// @COMPONENT
const SidebarMusicPlayer = () => {
  // @STATE - Playback Mode
  const [mode, setMode] = useState('online'); // 'local' | 'online'

  // @STATE - Playlists
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [onlinePlaylist] = useState([
    { name: 'Deep Focus Synth', artist: 'AE Audio', src: 'https://cdn.pixabay.com/audio/2022/11/22/audio_d0bc1522f7.mp3' },
    { name: 'Ambient Coding', artist: 'AE Audio', src: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' }
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // @REFS
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active playlist derived from mode
  const activePlaylist = mode === 'local' ? localPlaylist : onlinePlaylist;

  // @UTILITIES
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // @HANDLERS
  const handleModeToggle = () => {
    setMode(prev => prev === 'local' ? 'online' : 'local');
    setCurrentIndex(0);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handleFolderSelect = useCallback((e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('audio/'));
    if (files.length > 0) {
      setLocalPlaylist(files);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || activePlaylist.length === 0) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, activePlaylist.length]);

  const handleNext = useCallback(() => {
    if (activePlaylist.length === 0) return;
    
    if (isShuffle) {
      let nextIdx = Math.floor(Math.random() * activePlaylist.length);
      if (nextIdx === currentIndex && activePlaylist.length > 1) {
        nextIdx = (nextIdx + 1) % activePlaylist.length;
      }
      setCurrentIndex(nextIdx);
    } else {
      setCurrentIndex((prev) => (prev + 1) % activePlaylist.length);
    }
  }, [activePlaylist.length, isShuffle, currentIndex]);

  const handlePrev = useCallback(() => {
    if (activePlaylist.length === 0 || !audioRef.current) return;
    
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentIndex((prev) => (prev === 0 ? activePlaylist.length - 1 : prev - 1));
    }
  }, [activePlaylist.length]);

  const handleProgressClick = useCallback((e) => {
    if (!audioRef.current || !progressBarRef.current || activePlaylist.length === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    audioRef.current.currentTime = percentage * audioRef.current.duration;
    setProgress(percentage * 100);
  }, [activePlaylist.length]);

  // @EFFECTS [Playlist Source Manager]
  useEffect(() => {
    if (activePlaylist.length === 0) {
      setCurrentSrc(null);
      return;
    }

    const currentTrack = activePlaylist[currentIndex];
    let objectUrl = null;

    // Feed the audio tag based on the active mode
    if (mode === 'local') {
      objectUrl = URL.createObjectURL(currentTrack);
      setCurrentSrc(objectUrl);
    } else {
      setCurrentSrc(currentTrack.src);
    }

    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    }

    // Rule 3 Cleanup: Only revoke if we actually created a blob
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, localPlaylist, onlinePlaylist, currentIndex]);

  // @EFFECTS [Audio Event Listeners]
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(formatTime(audio.currentTime));
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => setDuration(formatTime(audio.duration));
    
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleNext, isRepeat]);

  // UI State Variables
  const currentTrack = activePlaylist[currentIndex];
  const trackTitle = currentTrack 
    ? (mode === 'local' ? currentTrack.name.replace(/\.[^/.]+$/, '') : currentTrack.name) 
    : (mode === 'local' ? 'No Folder Loaded' : 'No Stream Available');
  
  const trackArtist = currentTrack 
    ? (mode === 'local' ? `Track ${currentIndex + 1} of ${activePlaylist.length}` : currentTrack.artist) 
    : (mode === 'local' ? 'Select a local folder' : 'Standby');

  // Shared button styles
  const skipBtnStyle = 'flex items-center justify-center p-3 rounded-full transition-all text-text-secondary bg-surface-secondary hover:bg-surface-secondary-125  border border-transparent hover:border-border-tertiary disabled:opacity-30 disabled:cursor-not-allowed';
  const playBtnStyle = 'flex items-center justify-center p-5 rounded-full transition-all text-text-secondary bg-surface-secondary border border-border-tertiary hover:bg-surface-secondary-125 hover:border-border-primary active:scale-95 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100';
  const toggleBtnStyle = (isActive) => `flex items-center justify-center p-2 rounded-lg transition-all text-sm ${isActive ? 'text-accent-primary bg-accent-primary border border-border-tertiary' : 'text-text-secondary hover:text-text-secondary hover:border-border-tertiary border border-transparent'}`;

  return (
    <div className="w-full p-6 bg-surface-secondary rounded-2xl border border-border-tertiary shadow-lg flex flex-col">
      
      {/* Hidden File Input for Local Mode */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFolderSelect} 
        webkitdirectory="true" 
        directory="true" 
        multiple 
        className="hidden" 
      />

      {/* Header / Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        
        <Toggle 
          label={mode === 'online' ? 'Cloud Stream' : 'Local Disk'} 
          toggled={mode === 'local'} 
          onChange={handleModeToggle} 
        />

        {mode === 'local' && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs py-1 px-3 rounded bg-surface-secondary border border-border-tertiary hover:bg-surface-secondary text-text-secondary transition-colors"
          >
            {localPlaylist.length > 0 ? 'Change Folder' : 'Load Folder'}
          </button>
        )}
      </div>

      {/* Track Info */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 mb-5 rounded-xl bg-surface-secondary border border-surface-tertiary flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-muted/5 to-transparent"></div>
          <Icon name={mode === 'online' ? 'globe' : 'music'} className="text-tex-secondary opacity-50 text-3xl relative z-10" />
        </div>
        <h3 className="text-md text-text-secondary tracking-wide truncate w-full text-center px-2">
          {trackTitle}
        </h3>
        <p className="text-sm text-text-secondary truncate w-full text-center">
          {trackArtist}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="h-2 w-full bg-accent-primary rounded-full cursor-pointer overflow-hidden relative border border-border-tertiary"
        >
          <div 
            className="absolute top-0 left-0 h-full bg-copy-base transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1 text-[11px] font-mono font-bold text-text-secondary tracking-wider">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>

      {/* Playback Controls Row */}
      <div className="flex items-center justify-between mb-2 px-2">
        <button 
          onClick={() => setIsShuffle(!isShuffle)} 
          className={toggleBtnStyle(isShuffle)}
          title="Shuffle"
          disabled={activePlaylist.length === 0}
        >
           <Icon name="shuffle" />
        </button>

        <div className="flex items-center gap-4">
          <button onClick={handlePrev} disabled={activePlaylist.length === 0} className={skipBtnStyle}>
            <Icon name="skipBack" />
          </button>
          
          <button 
            onClick={togglePlay} 
            disabled={activePlaylist.length === 0}
            className={playBtnStyle}
          >
            <Icon name={isPlaying ? 'pause' : 'play'} />
          </button>

          <button onClick={handleNext} disabled={activePlaylist.length === 0} className={skipBtnStyle}>
            <Icon name="skipForward" />
          </button>
        </div>

        <button 
          onClick={() => setIsRepeat(!isRepeat)} 
          className={toggleBtnStyle(isRepeat)}
          title="Repeat"
          disabled={activePlaylist.length === 0}
        >
          <Icon name="repeat" />
        </button>
      </div>

      {/* Hidden Native Audio Engine */}
      <audio ref={audioRef} src={currentSrc} preload="metadata" />
    </div>
  );
};

export default SidebarMusicPlayer;