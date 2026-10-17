import { useEffect, useState } from 'react';
import { player } from './audio/player';
import { usePlayer } from './audio/usePlayer';
import { type TrackId } from './data/tracks';
import { ObservatoryCanvas } from './components/ObservatoryCanvas';
import { TrackIndex } from './components/TrackIndex';
import { NowPlaying } from './components/NowPlaying';
import { ListeningPanel } from './components/ListeningPanel';
import { SplashScreen } from './components/SplashScreen';
import { BrandIntro } from './components/BrandIntro';
import { AudioReactiveBackground } from './components/AudioReactiveBackground';

/**
 * The top-level composition.
 *
 * Coordinates the opening reveal, the main canvas, the side index, and the
 * expanded listening room.
 */
export function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [entered, setEntered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hoverId, setHoverId] = useState<TrackId | null>(null);
  
  // Hook the app's active track directly to the player's internal state
  const playerActiveId = usePlayer((s) => s.currentId);
  const isPlaying = usePlayer((s) => s.status === 'playing' || s.status === 'loading');
  
  // We keep a local state to know if the user specifically entered the "listening room" view
  const [roomOpen, setRoomOpen] = useState(false);

  const activeId = roomOpen ? playerActiveId : null;

  useEffect(() => {
    if (entered) {
      const timer = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(timer);
    }
  }, [entered]);

  const handleIntroComplete = () => {
    setIntroComplete(true);
  };

  const handleSplashEnter = (trackId?: TrackId) => {
    setEntered(true);
    if (trackId) {
      // Delay selection until the canvas has likely rendered so FLIP can work
      setTimeout(() => {
        handleSelect(trackId);
      }, 300);
    }
  };

  const handleSelect = (id: TrackId) => {
    setRoomOpen(true);
    player.select(id, { autoplay: true });
  };

  const handleOpenRoom = (id: TrackId) => {
    setRoomOpen(true);
    if (player.getState().currentId !== id) {
      player.select(id, { autoplay: true });
    }
  };

  const handleBackToSplash = () => {
    setEntered(false);
    setRevealed(false);
    setRoomOpen(false);
    player.pause();
  };

  return (
    <>
      {!introComplete && <BrandIntro onComplete={handleIntroComplete} />}
      {!entered && <SplashScreen onEnter={handleSplashEnter} />}

      <header className="header" data-revealed={revealed || undefined}>
        <h1 
          className="wordmark" 
          onClick={entered ? handleBackToSplash : undefined}
          style={{ cursor: entered ? 'pointer' : 'default' }}
          title={entered ? "Return to Introduction" : undefined}
        >
          ODUVIL<span className="wordmark-dot">.</span>
        </h1>
      </header>

      <main className="main">
        <AudioReactiveBackground active={isPlaying && entered} />
        <ObservatoryCanvas
          activeId={activeId}
          hoverId={hoverId}
          liftedId={roomOpen ? activeId : null}
          receded={roomOpen}
          revealed={revealed}
          onHover={setHoverId}
          onSelect={handleSelect}
        />
        <TrackIndex
          activeId={activeId}
          hoverId={hoverId}
          onHover={setHoverId}
          onSelect={handleSelect}
        />
        <NowPlaying hidden={roomOpen} onOpen={handleOpenRoom} />
      </main>

      {roomOpen && activeId && (
        <ListeningPanel id={activeId} onClose={() => setRoomOpen(false)} />
      )}
    </>
  );
}
