/**
 * @PATH [src/renderer/src/contexts/LibraryProvider.jsx]
 * @REV 20260303-0256
 * @MODULE [CTX]
 * @STATUS [DEV]
 * @FILETYPE [CTX]
 * @DESC [Global Context for Library Data and IPC Communication]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LibraryContext = createContext()

export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider')
  }
  return context
}

export const LibraryProvider = ({ children }) => {
  const [tracks, setTracks] = useState([])
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [isScanning, setIsScanning] = useState(false)

  // 1. Load from cache on boot
  const loadCache = useCallback(async () => {
    if (!window.electronAPI) return

    try {
      const data = await window.electronAPI.library.loadCache()
      if (data) {
        setTracks(data.tracks || [])
        setAlbums(data.albums || [])
        setArtists(data.artists || [])
        setPlaylists(data.playlists || [])
      }
    } catch (error) {
      console.error('Failed to load library cache:', error)
    }
  }, [])

  useEffect(() => {
    loadCache()
  }, [loadCache])

  // 2. Trigger OS directory picker and run recursive scan
  const scanDirectory = async () => {
    if (!window.electronAPI) return

    try {
      const dirPath = await window.electronAPI.system.selectDir()
      if (!dirPath) return

      setIsScanning(true)
      const data = await window.electronAPI.library.scan(dirPath)

      if (data) {
        setTracks(data.tracks || [])
        setAlbums(data.albums || [])
        setArtists(data.artists || [])
        setPlaylists(data.playlists || [])
      }
    } catch (error) {
      console.error('Failed to scan directory:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const contextValue = {
    tracks,
    albums,
    artists,
    playlists,
    isScanning,
    scanDirectory,
    refreshLibrary: loadCache
  }

  return <LibraryContext.Provider value={contextValue}>{children}</LibraryContext.Provider>
}
