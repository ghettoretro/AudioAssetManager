/**
 * @PATH [src/preload/index.js]
 * @REV 20260303-0156
 * @MODULE [COM]
 * @STATUS [DEV]
 * @FILETYPE [CFG]
 * @DESC [Electron Preload Script - Context Bridge API]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  system: {
    selectDir: () => ipcRenderer.invoke('system:selectDir')
  },
  library: {
    scan: (directoryPath) => ipcRenderer.invoke('library:scan', directoryPath),
    loadCache: () => ipcRenderer.invoke('library:loadCache')
  },
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: (settingsPayload) => ipcRenderer.invoke('settings:save', settingsPayload)
  },
  os: {
    // This allows React to send state to the OS (e.g., updating a system tray)
    mediaControl: (action) => ipcRenderer.invoke('os:mediaControl', action),

    // NEW: This allows React to listen to hardware button presses
    onMediaCommand: (callback) => {
      // Strip the event object and just pass the command string to React
      ipcRenderer.on('os:mediaCommandReceived', (_event, command) => callback(command))
    },

    // Cleanup listener to prevent memory leaks in React
    removeMediaListeners: () => {
      ipcRenderer.removeAllListeners('os:mediaCommandReceived')
    }
  },
  window: {
    setMode: (mode) => ipcRenderer.invoke('window:setMode', mode)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electronAPI = api
}
