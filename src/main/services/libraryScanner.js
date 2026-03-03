/**
 * @PATH [src/main/services/libraryScanner.js]
 * @REV 20260303-0158
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [SVC]
 * @DESC [Recursive directory scanner and ID3 metadata extractor]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Optimize album art extraction (base64 strings can bloat JSON; consider writing to temp image files for v2)
 * @TODO_END
 * =====================================*/

import { promises as fs } from 'fs'
import { join, extname, basename } from 'path'
import * as mm from 'music-metadata'
import crypto from 'crypto'

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a'])

// Helper: Hash absolute path to create a deterministic ID
const generateId = (string) => crypto.createHash('md5').update(string).digest('hex')

async function walkDirectory(dir, fileList = []) {
  const files = await fs.readdir(dir)
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = await fs.stat(filePath)
    if (stat.isDirectory()) {
      await walkDirectory(filePath, fileList)
    } else if (SUPPORTED_EXTENSIONS.has(extname(file).toLowerCase())) {
      fileList.push(filePath)
    }
  }
  return fileList
}

export const LibraryScanner = {
  async scan(directoryPath) {
    const files = await walkDirectory(directoryPath)
    
    const library = {
      tracks: [],
      albums: [],
      artists: [],
      playlists: []
    }

    // Maps for fast relationship lookups during the scan
    const albumMap = new Map()
    const artistMap = new Map()

    for (const filePath of files) {
      try {
        const metadata = await mm.parseFile(filePath, { duration: true, skipCovers: false })
        const { common, format } = metadata

        const trackId = generateId(filePath)
        const artistName = common.artist || 'Unknown Artist'
        const albumName = common.album || 'Unknown Album'
        const artistId = generateId(artistName)
        const albumId = generateId(`${artistName}-${albumName}`) // Composite key

        // 1. Process Artist
        if (!artistMap.has(artistId)) {
          artistMap.set(artistId, {
            id: artistId,
            name: artistName,
            albumIds: new Set()
          })
        }
        artistMap.get(artistId).albumIds.add(albumId)

        // 2. Process Album & Cover Art
        let coverArtBase64 = ''
        if (common.picture && common.picture.length > 0) {
          const pic = common.picture[0]
          coverArtBase64 = `data:${pic.format};base64,${pic.data.toString('base64')}`
        }

        if (!albumMap.has(albumId)) {
          albumMap.set(albumId, {
            id: albumId,
            title: albumName,
            artist: artistName,
            year: common.year ? common.year.toString() : '',
            coverArt: coverArtBase64,
            trackIds: []
          })
        }
        albumMap.get(albumId).trackIds.push(trackId)

        // 3. Process Track
        library.tracks.push({
          id: trackId,
          title: common.title || basename(filePath, extname(filePath)),
          artist: artistName,
          album: albumName,
          genre: common.genre || [],
          duration: format.duration || 0,
          audioSrc: filePath,
          coverArt: coverArtBase64,
          energyTag: '' // Placeholder for future background analysis
        })

      } catch (err) {
        console.warn(`Skipping unreadable file: ${filePath}`, err.message)
      }
    }

    // Convert Maps and Sets back to arrays for JSON serialization
    library.albums = Array.from(albumMap.values())
    library.artists = Array.from(artistMap.values()).map(artist => ({
      ...artist,
      albumIds: Array.from(artist.albumIds)
    }))

    return library
  }
}