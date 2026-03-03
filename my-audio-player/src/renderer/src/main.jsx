/**
 * @PATH [src/renderer/src/main.jsx]
 * @REV 20260303-0257
 * @MODULE [CFG]
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

// If the boilerplate generated an assets/main.css or index.css, keep that import here
// import './assets/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LibraryProvider>
      <AudioEngineProvider>
        <App />
      </AudioEngineProvider>
    </LibraryProvider>
  </React.StrictMode>
)
