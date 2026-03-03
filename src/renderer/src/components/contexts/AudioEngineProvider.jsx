/**
 * @PATH [src/renderer/src/contexts/AudioEngineProvider.jsx]
 * @REV 20260303-0245
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [CTX]
 * @DESC [Global Context for Web Audio API and Playback State]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Implement transient (kick drum) extraction logic in useFrame pipeline later
 * @TODO_END
 * =====================================*/

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioEngineContext = createContext()

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext)
  if (!context) {
    throw new Error('useAudioEngine must be used within an AudioEngineProvider')
  }
  return context
}

export const AudioEngineProvider = ({ children }) => {
  // --- Volatile React State (PRD 1 Schema) ---
  const [status, setStatus] = useState('IDLE') // 'IDLE', 'PLAYING', 'PAUSED', 'BUFFERING'
  const [currentTrack, setCurrentTrack] = useState(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1.0)
  const [queue, setQueue] = useState([])
  const [queuePosition, setQueuePosition] = useState(0)
  const [mode, setMode] = useState('NORMAL') // 'NORMAL', 'SHUFFLE', 'LOOP_TRACK', 'LOOP_ALL'

  // --- Web Audio API Refs (Mutable, Non-Rendering) ---
  const audioContextRef = useRef(null)
  const audioNodeRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const gainNodeRef = useRef(null)
  const progressFrameRef = useRef(null)

  // --- 1. Queue Logic (Declared first to avoid hoisting errors) ---
  const handleTrackEnd = useCallback(() => {
    // Scaffold: Logic for NEXT, SHUFFLE, LOOP goes here
    console.log('Track Ended')
    setStatus('IDLE')
  }, [])

  // --- 2. AudioContext Initialization (Lazy Load) ---
  const initAudioGraph = useCallback(() => {
    if (audioContextRef.current) return

    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContextRef.current = new AudioContext()

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audioNodeRef.current = audio

    sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
    analyserRef.current = audioContextRef.current.createAnalyser()
    gainNodeRef.current = audioContextRef.current.createGain()

    analyserRef.current.fftSize = 2048
    analyserRef.current.smoothingTimeConstant = 0.8

    sourceRef.current.connect(analyserRef.current)
    analyserRef.current.connect(gainNodeRef.current)
    gainNodeRef.current.connect(audioContextRef.current.destination)

    audio.addEventListener('ended', handleTrackEnd)
    audio.addEventListener('playing', () => setStatus('PLAYING'))
    audio.addEventListener('pause', () => setStatus('PAUSED'))
    audio.addEventListener('waiting', () => setStatus('BUFFERING'))
  }, [handleTrackEnd])

  // --- 3. Playback Controls ---
  const playTrack = useCallback(
    async (track) => {
      initAudioGraph()
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      const mediaUrl = `local-media://${encodeURIComponent(track.audioSrc)}`

      audioNodeRef.current.src = mediaUrl
      audioNodeRef.current.load()
      audioNodeRef.current.play()

      setCurrentTrack(track)
      setStatus('PLAYING')
    },
    [initAudioGraph]
  )

  const togglePlayback = useCallback(() => {
    if (!audioNodeRef.current || !currentTrack) return

    if (status === 'PLAYING') {
      audioNodeRef.current.pause()
    } else {
      audioNodeRef.current.play()
    }
  }, [status, currentTrack])

  // --- 4. OS Hardware Button Integration ---
  useEffect(() => {
    const handleOSCommand = (command) => {
      switch (command) {
        case 'TOGGLE_PLAYBACK':
          togglePlayback()
          break
        // NEXT_TRACK, PREV_TRACK, etc.
      }
    }

    if (window.electronAPI?.os) {
      window.electronAPI.os.onMediaCommand(handleOSCommand)
    }

    return () => {
      if (window.electronAPI?.os) {
        window.electronAPI.os.removeMediaListeners()
      }
    }
  }, [togglePlayback])

  // --- 5. Progress Tracking Loop ---
  useEffect(() => {
    const updateProgress = () => {
      if (audioNodeRef.current && status === 'PLAYING') {
        setProgress(audioNodeRef.current.currentTime)
      }
      progressFrameRef.current = requestAnimationFrame(updateProgress)
    }

    if (status === 'PLAYING') {
      progressFrameRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current)
    }
  }, [status])

  const contextValue = {
    status,
    currentTrack,
    progress,
    volume,
    queue,
    queuePosition,
    mode,
    getAnalyserNode: () => analyserRef.current,
    playTrack,
    togglePlayback,
    setQueue,
    setQueuePosition,
    setMode,
    setVolume: (v) => {
      setVolume(v)
      if (gainNodeRef.current) gainNodeRef.current.gain.value = v
    }
  }

  return <AudioEngineContext.Provider value={contextValue}>{children}</AudioEngineContext.Provider>
}
