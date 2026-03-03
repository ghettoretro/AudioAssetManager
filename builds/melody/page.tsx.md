'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Library,
  ListMusic,
  Search as SearchIcon,
} from 'lucide-react';

import { playlists, songs, type Song } from '@/lib/data';
import { useMusicPlayer } from '@/components/MusicProvider';
import SongList from '@/components/SongList';
import Header from '@/components/Header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activePlaylist, setActivePlaylist] = React.useState<Song[] | null>(
    null
  );

  const { setPlayQueue, playSong } = useMusicPlayer();

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaylistClick = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      const playlistSongs = songs.filter((s) => playlist.songs.includes(s.id));
      setActivePlaylist(playlistSongs);
      setPlayQueue(playlistSongs);
    }
  };

  const handleSongClick = (songId: number, songList: Song[]) => {
    setPlayQueue(songList);
    playSong(songList.findIndex(s => s.id === songId));
  };
  
  if (activePlaylist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setActivePlaylist(null)}
          className="mb-4 text-primary font-bold"
        >
          &larr; Back to Playlists
        </button>
        <SongList songs={activePlaylist} onSongClick={(id) => handleSongClick(id, activePlaylist)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <Header />
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/60">
          <TabsTrigger value="library">
            <Library className="w-4 h-4 mr-2" /> Library
          </TabsTrigger>
          <TabsTrigger value="search">
            <SearchIcon className="w-4 h-4 mr-2" /> Search
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <ListMusic className="w-4 h-4 mr-2" /> Playlists
          </TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-6">
          <SongList songs={songs} onSongClick={(id) => handleSongClick(id, songs)} />
        </TabsContent>
        <TabsContent value="search" className="mt-6">
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for songs, artists, albums..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <SongList songs={filteredSongs} onSongClick={(id) => handleSongClick(id, filteredSongs)} />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                   <Image
                      src={
                        songs.find((s) => s.id === playlist.songs[0])
                          ?.coverArt || PlaceHolderImages[0].imageUrl
                      }
                      alt={playlist.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover aspect-square"
                    />
                  <div className="flex-1">
                    <CardTitle className="font-headline">{playlist.name}</CardTitle>
                    <CardDescription>{playlist.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
