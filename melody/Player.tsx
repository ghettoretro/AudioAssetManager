'use client';

import Image from 'next/image';
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useMusicPlayer } from './MusicProvider';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    currentTime,
    duration,
    seek,
    isShuffling,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
  } = useMusicPlayer();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-card/80 backdrop-blur-md border-t z-50 flex items-center justify-center p-4">
            <p className="text-muted-foreground">Select a song to play</p>
        </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t z-50 p-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-4 w-full md:w-1/4">
          <Image
            src={currentSong.coverArt}
            alt={currentSong.title}
            width={64}
            height={64}
            className="rounded-md aspect-square object-cover"
          />
          <div>
            <h3 className="font-bold font-headline truncate max-w-[150px] sm:max-w-xs">
              {currentSong.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-xs">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 w-full md:w-1/2">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleShuffle} title="Shuffle">
              <Shuffle
                className={cn('w-5 h-5', isShuffling ? 'text-accent' : 'text-muted-foreground', 'hover:text-foreground transition-colors')}
              />
            </button>
            <button onClick={prevSong} title="Previous">
              <SkipBack className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-primary text-primary-foreground rounded-full p-3 hover:scale-110 transition-transform shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={nextSong} title="Next">
              <SkipForward className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
            </button>
             <button onClick={toggleRepeat} title="Repeat">
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5 text-accent" />
              ) : (
                <Repeat className={cn('w-5 h-5', repeatMode === 'all' ? 'text-accent' : 'text-muted-foreground', 'hover:text-foreground transition-colors')} />
              )}
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(value) => seek(value[0])}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume controls etc. can be added here */}
        <div className="hidden md:flex w-1/4" />
      </div>
    </div>
  );
};

export default Player;
