/**
 * @PATH [src/renderer/src/contexts/SkinProvider.jsx]
 * @REV 20260303-0640
 * @MODULE [CTX]
 * @STATUS [DEV]
 * @FILETYPE [CTX]
 * @DESC [Global Context for Dynamic Skin and CSS Variable Injection]
 * @COMPLIANCE [None]
 * -------------------------------------
 * @TODO_START
 * [*] Persist user's selected skin to the CacheManager on change
 * @TODO_END
 * =====================================*/

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */

import { createContext, useContext, useState, useEffect } from 'react'

// --- Hardcoded Stub Data for V1 Testing ---
export const SKINS = {
  ZERG: {
    meta: { id: 'skin_zerg_v1', name: 'Zerg Biomass' },
    render: { type: '3D_MESH', vertex: 'zerg.vert.glsl', fragment: 'zerg.frag.glsl' },
    ui: {
        '--bg-panel': 'rgba(20, 0, 0, 0.75)',
        '--bg-control': 'rgba(40, 0, 0, 0.9)',
        '--text-primary': '#ff4444',
        '--text-secondary': '#aa2222',
        '--accent-main': '#ff0000',
        '--accent-hover': '#ff5555',
        '--border-color': 'rgba(255, 0, 0, 0.4)',
        '--border-radius': '0px',
        '--border-width': '1px',
        '--backdrop-blur': '4px',
        '--font-family': "'Courier New', monospace",
        '--window-shape': 'polygon(20% 0%, 100% 15%, 85% 100%, 0% 80%)'
    }
  },
  BIOMECH: {
    meta: { id: 'skin_biomech_v1', name: 'Clean Room Biomech' },
    render: { type: '2D_SHADER', vertex: 'biomech.vert.glsl', fragment: 'biomech.frag.glsl' },
    ui: {
        '--bg-panel': 'rgba(0, 20, 30, 0.4)',
        '--bg-control': 'rgba(0, 40, 60, 0.6)',
        '--text-primary': '#e0ffff',
        '--text-secondary': '#00aaff',
        '--accent-main': '#00ffcc',
        '--accent-hover': '#55ffdd',
        '--border-color': 'rgba(0, 255, 204, 0.2)',
        '--border-radius': '12px',
        '--border-width': '1px',
        '--backdrop-blur': '16px',
        '--font-family': "system-ui, -apple-system, sans-serif",
        '--window-shape': "path('M 400 100 C 450 300 400 600 250 630 C 50 650 0 450 20 250 C 50 50 300 -50 400 100 Z')"
    }
  }
}

const SkinContext = createContext()

export const useSkin = () => {
  const context = useContext(SkinContext)
  if (!context) {
    throw new Error('useSkin must be used within a SkinProvider')
  }
  return context
}

export const SkinProvider = ({ children }) => {
  const [activeSkin, setActiveSkin] = useState(SKINS.ZERG)

  // Inject the UI object into the DOM as CSS Custom Properties
  useEffect(() => {
    const root = document.documentElement
    
    // Loop through the UI keys and apply them to the :root
    Object.entries(activeSkin.ui).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // No specific cleanup needed here, as the next render just overwrites the variables
  }, [activeSkin])

  const contextValue = {
    activeSkin,
    setActiveSkin
  }

  return (
    <SkinContext.Provider value={contextValue}>
      {children}
    </SkinContext.Provider>
  )
}