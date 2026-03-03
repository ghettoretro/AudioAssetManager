/**
 * @PATH [src/renderer/src/main.jsx]
 * @REV 20260303-0257
 * @MODULE [AURALIS]
 * @STATUS [DEV]
 * @FILETYPE [CFG]
 * @DESC [React Root Entry Point and Context Wrapping]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AudioEngineProvider } from './contexts/AudioEngineProvider'
import { LibraryProvider } from './contexts/LibraryProvider'
import { SkinProvider } from './contexts/SkinProvider'
import '../src/assets/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SkinProvider>
      <LibraryProvider>
        <AudioEngineProvider>
          <App />
        </AudioEngineProvider>
      </LibraryProvider>
    </SkinProvider>
  </React.StrictMode>
)
