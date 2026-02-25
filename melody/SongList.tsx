'use client';

import Image from 'next/image';
import { Music, Pause, Play } from 'lucide-react';
import { type Song } from '@/lib/data';
import { useMusicPlayer } from './MusicProvider';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface SongListProps {
  songs: Song[];
  onSongClick: (songId: number) => void;
}

const SongList = ({ songs, onSongClick }: SongListProps) => {
  const { currentSong, isPlaying } = useMusicPlayer();

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-2 pr-4">
        {songs.map((song) => {
          const isActive = currentSong?.id === song.id;
          return (
            <div
              key={song.id}
              className={cn(
                'flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors',
                isActive
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/80'
              )}
              onClick={() => onSongClick(song.id)}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={song.coverArt}
                  alt={song.title}
                  fill
                  className="rounded-md object-cover"
                />
                 <div className={cn(
                    'absolute inset-0 bg-black/50 flex items-center justify-center rounded-md transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}>
                  {isActive && isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : isActive ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    'font-semibold truncate',
                    isActive && 'text-primary'
                  )}
                >
                  {song.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist}
                </p>
              </div>
              {isActive ? (
                <div className="flex items-center gap-1 text-primary">
                  <Music className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{song.duration}</p>
              )}
            </div>
          );
        })}
         {songs.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
                <p>No songs found.</p>
            </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SongList;
