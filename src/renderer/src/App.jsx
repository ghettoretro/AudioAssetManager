/**
 * @PATH [src/renderer/src/App.jsx]
 * @REV 20260303-0640
 * @MODULE [UI]
 * @STATUS [DEV]
 * @FILETYPE [CMP]
 * @DESC [Bio-Shell Master Layout Assembly]
 * @COMPLIANCE [None]
 * =====================================*/

import { useLibrary } from './contexts/LibraryProvider'
import { useSkin, SKINS } from './contexts/SkinProvider'
import BioShell from './components/BioShell'
import TrackList from './components/ui/TrackList'
import PlayerBar from './components/ui/PlayerBar'
import '../src/assets/main.css'

export default function App() {
  const { isScanning, scanDirectory } = useLibrary()
  const { activeSkin, setActiveSkin } = useSkin()

  const toggleSkin = () => {
    setActiveSkin(activeSkin.meta.id === 'skin_zerg_v1' ? SKINS.BIOMECH : SKINS.ZERG)
  }

  return (
    <div 
      style={{
        width: '450px',
        height: '650px',
        position: 'absolute',
        top: '10vh',
        left: '10vw',
        clipPath: 'var(--window-shape)',
        WebkitAppRegion: 'drag', // Makes the whole irregular shape draggable
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-family)', // Pulled from the Skin Context
      }}
    >
      <BioShell />

      {/* Top Header & Dev Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', WebkitAppRegion: 'no-drag' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Auralis Audio
          </h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>{activeSkin.meta.name}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={toggleSkin}
            style={{ padding: '6px 12px', background: 'var(--bg-control)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', cursor: 'pointer' }}
          >
            Swap Skin
          </button>
          <button 
            onClick={scanDirectory}
            disabled={isScanning}
            style={{ padding: '6px 12px', background: 'var(--accent-main)', color: '#000', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isScanning ? '...' : '+ Load'}
          </button>
        </div>
      </div>

      {/* Main Track List Area */}
      <div style={{ flex: 1, WebkitAppRegion: 'no-drag', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TrackList />
      </div>

      {/* Fixed Bottom Player Deck */}
      <div style={{ marginTop: '20px' }}>
        <PlayerBar />
      </div>

    </div>
  )
}