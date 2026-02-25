'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { songs as allSongs, type Song } from '@/lib/data';

interface MusicPlayerContextType {
  isPlaying: boolean;
  currentSong: Song | null;
  playQueue: Song[];
  currentTime: number;
  duration: number;
  isShuffling: boolean;
  repeatMode: 'off' | 'one' | 'all';
  playSong: (songIndex: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  setPlayQueue: (songs: Song[]) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [playQueue, setPlayQueue] = useState<Song[]>(allSongs);
  const [originalQueue, setOriginalQueue] = useState<Song[]>(allSongs);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong =
    currentSongIndex >= 0 ? playQueue[currentSongIndex] : null;

  const playSong = (songIndex: number) => {
    setCurrentSongIndex(songIndex);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSongIndex === -1 && playQueue.length > 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextSong();
    }
  }, [repeatMode]);

  const nextSong = useCallback(() => {
    if (playQueue.length === 0) return;
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    setCurrentSongIndex(nextIndex);
  }, [currentSongIndex, playQueue, repeatMode]);

  const prevSong = () => {
    if (playQueue.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentSongIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : playQueue.length - 1
      );
    }
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const shuffleArray = (array: Song[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const toggleShuffle = () => {
    setIsShuffling(prev => {
      const newShuffleState = !prev;
      if (newShuffleState) {
        const current = currentSong;
        const shuffled = shuffleArray(originalQueue);
        if (current) {
          const newIndex = shuffled.findIndex(s => s.id === current.id);
          // Move current song to the top of the shuffled queue
          if (newIndex > 0) {
            const item = shuffled.splice(newIndex, 1)[0];
            shuffled.unshift(item);
          }
        }
        setPlayQueue(shuffled);
        setCurrentSongIndex(current ? 0 : -1);
      } else {
        const current = currentSong;
        setPlayQueue(originalQueue);
        setCurrentSongIndex(current ? originalQueue.findIndex(s => s.id === current.id) : -1);
      }
      return newShuffleState;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleSetPlayQueue = (songs: Song[]) => {
    setOriginalQueue(songs);
    if(isShuffling) {
        setPlayQueue(shuffleArray(songs));
    } else {
        setPlayQueue(songs);
    }
  }

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateCurrentTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);

      audio.addEventListener('timeupdate', updateCurrentTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateCurrentTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [handleEnded]);

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        currentSong,
        playQueue,
        currentTime,
        duration,
        isShuffling,
        repeatMode,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setPlayQueue: handleSetPlayQueue,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
      <audio ref={audioRef} src={currentSong?.audioSrc} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  return context;
};
