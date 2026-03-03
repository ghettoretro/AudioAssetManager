/**
 * @PATH [src/main/services/cacheManager.js]
 * @REV 20260303-0158
 * @MODULE [OS]
 * @STATUS [DEV]
 * @FILETYPE [SVC]
 * @DESC [Handles disk I/O for JSON persistence in the OS userData directory]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

const userDataPath = app.getPath('userData')
const LIBRARY_FILE = join(userDataPath, 'library.json')
const PREFS_FILE = join(userDataPath, 'preferences.json')

export const CacheManager = {
  async saveLibrary(data) {
    try {
      await fs.writeFile(LIBRARY_FILE, JSON.stringify(data), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save library cache:', error)
      return false
    }
  },

  async loadLibrary() {
    try {
      const data = await fs.readFile(LIBRARY_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // Return empty schema if file doesn't exist yet
      return { tracks: [], albums: [], artists: [], playlists: [] }
    }
  },

  async savePreferences(data) {
    try {
      await fs.writeFile(PREFS_FILE, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to save preferences:', error)
      return false
    }
  },

  async loadPreferences() {
    try {
      const data = await fs.readFile(PREFS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // Default preferences schema
      return {
        settings: {
          scanDirectories: [],
          supportedFormats: ['.mp3', '.flac', '.wav', '.ogg'],
          theme: 'dark',
          language: 'en-US'
        }
      }
    }
  }
}