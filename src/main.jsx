/**
 * @PATH [src/main.jsx]
 * @REV [20260225-0150]
 * @MODULE [OS]
 * @STATUS [DEV]
 * @FILETYPE [HOK]
 * @DESC ["Main application entry point for the Audio Asset Manager UI"]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
