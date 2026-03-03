/**
 * @PATH [src/main/index.js]
 * @REV 20260303-0237
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [CFG]
 * @DESC [Electron Main Process - OS Integrations, IPC Handlers, and Window Management]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Implement full recursive directory scanning and music-metadata extraction
 * [*] Implement JSON disk read/write for library and settings caches
 * @TODO_END
 * =====================================*/
/* eslint-env node */
import { app, shell, BrowserWindow, ipcMain, dialog, protocol, net, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { pathToFileURL } from 'url'
import { CacheManager } from './services/cacheManager.js'
import { LibraryScanner } from './services/libraryScanner.js'

// Register the custom protocol as privileged BEFORE the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-media',
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      supportFetchAPI: true,
      stream: true // <--- THIS IS THE CRITICAL FLAG FOR AUDIO TAGS
    }
  }
])

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // '__dirname' is not defined.
      sandbox: false,
      webSecurity: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) { // 'process' is not defined.
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']) // 'process' is not defined.
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')) // '__dirname' is not defined.
  }
}

// Helper function to send commands to React
const sendMediaCommand = (command) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('os:mediaCommandReceived', command)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.adaptiveengine.bioaudio')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Register Global Media Shortcuts
  globalShortcut.register('MediaPlayPause', () => sendMediaCommand('TOGGLE_PLAYBACK'))
  globalShortcut.register('MediaNextTrack', () => sendMediaCommand('NEXT_TRACK'))
  globalShortcut.register('MediaPreviousTrack', () => sendMediaCommand('PREV_TRACK'))
  globalShortcut.register('MediaStop', () => sendMediaCommand('STOP'))

  // Register custom protocol to bypass CORS for local audio files in Web Audio API
  protocol.handle('local-media', (request) => {
    // Extract the absolute path from the search parameter
    const url = new URL(request.url)
    const filePath = decodeURIComponent(url.searchParams.get('path'))
    return net.fetch(pathToFileURL(filePath).toString())
  })

  // --- IPC Handlers ---

  ipcMain.handle('system:selectDir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (canceled) return null
    return filePaths[0]
  })

  ipcMain.handle('library:scan', async (_, directoryPath) => {
    const libraryPayload = await LibraryScanner.scan(directoryPath)
    await CacheManager.saveLibrary(libraryPayload) // Persist automatically after scan
    return libraryPayload
  })

  ipcMain.handle('library:loadCache', async () => {
    return await CacheManager.loadLibrary()
  })

  ipcMain.handle('settings:load', async () => {
    return await CacheManager.loadPreferences()
  })

  ipcMain.handle('settings:save', async (_, settingsPayload) => {
    return await CacheManager.savePreferences(settingsPayload)
  })

  ipcMain.handle('os:mediaControl', async (_, action) => {
    // Scaffold: Hook into globalShortcut or system media controls
    console.log(`Media Action: ${action}`)
    return true
  })

  ipcMain.handle('window:setMode', async (_, mode) => {
    if (!mainWindow) return false

    if (mode === 'MINI') {
      mainWindow.setMinimumSize(300, 150)
      mainWindow.setSize(300, 150, true)
      mainWindow.setAlwaysOnTop(true)
    } else if (mode === 'TRUTH') {
      mainWindow.setAlwaysOnTop(false)
      mainWindow.setMinimumSize(800, 600)
      mainWindow.setSize(900, 670, true)
    }
    return true
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// CRITICAL: Unregister shortcuts when the app quits so we don't hold the OS hostage
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // 'process' is not defined.
    app.quit()
  }
})
