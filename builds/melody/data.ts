import { PlaceHolderImages } from './placeholder-images';

export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioSrc: string;
  coverArt: string;
};

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/placeholder/300/300';

export const songs: Song[] = [
  {
    id: 1,
    title: "Summer Breeze",
    artist: "The Vibe Creators",
    album: "Sunny Days",
    duration: "2:54",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverArt: findImage('album-art-1'),
  },
  {
    id: 2,
    title: "City Lights",
    artist: "Urban Groove",
    album: "Metropolis",
    duration: "3:12",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverArt: findImage('album-art-4'),
  },
  {
    id: 3,
    title: "Ocean Deep",
    artist: "Aqua Marine",
    album: "Tidal Waves",
    duration: "4:01",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverArt: findImage('album-art-2'),
  },
  {
    id: 4,
    title: "Retro Dreams",
    artist: "80s Rewind",
    album: "Nostalgia",
    duration: "3:30",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverArt: findImage('album-art-3'),
  },
  {
    id: 5,
    title: "Sunset Chaser",
    artist: "The Wanderers",
    album: "Golden Hour",
    duration: "3:45",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverArt: findImage('album-art-5'),
  },
  {
    id: 6,
    title: "Morning Dew",
    artist: "Nature's Harmony",
    album: "Awakening",
    duration: "2:48",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverArt: findImage('album-art-6'),
  },
    {
    id: 7,
    title: "Starlight",
    artist: "Cosmic Echoes",
    album: "Galaxy",
    duration: "4:20",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverArt: findImage('album-art-1'),
  },
  {
    id: 8,
    title: "Jungle Beat",
    artist: "Tribal Rhythm",
    album: "Wild",
    duration: "3:05",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverArt: findImage('album-art-2'),
  },
];

export type Playlist = {
    id: string;
    name: string;
    songs: number[]; // array of song ids
    description: string;
}

export const playlists: Playlist[] = [
    {
        id: 'chill-vibes',
        name: 'Chill Vibes',
        songs: [1, 3, 5, 6],
        description: 'Relax and unwind with these mellow tracks.'
    },
    {
        id: 'upbeat-groove',
        name: 'Upbeat Groove',
        songs: [2, 4, 7, 8],
        description: 'Get energized with these danceable tunes.'
    },
    {
        id: 'late-night-drive',
        name: 'Late Night Drive',
        songs: [2, 5, 7],
        description: 'The perfect soundtrack for a drive after dark.'
    }
]
