import { useState } from 'react';
import { Countdown } from './Countdown';
import { SplashDiagram } from './SplashDiagram';
import { SplashEngraving } from './SplashEngraving';
import { SpotifyIcon, AppleMusicIcon, InstagramIcon, YouTubeIcon } from './BrandGlyphs';
import { Starfield } from './Starfield';
import { PresaveTelemetry } from './PresaveTelemetry';
import { SignalTicker } from './SignalTicker';
import { telemetry } from '../data/telemetry';
import { SPOTIFY_PRESAVE_URL, APPLE_MUSIC_URL, APPLE_MUSIC_ARTIST_URL, type TrackId } from '../data/tracks';

interface Props {
  onEnter: (trackId?: TrackId) => void;
  onOpenPass: (trackId?: TrackId) => void;
}

export function SplashScreen({ onEnter, onOpenPass }: Props) {
  const [exiting, setExiting] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<{cx: number, cy: number} | null>(null);

  const handleEnter = (trackId?: TrackId, cx?: number, cy?: number) => {
    setZoomTarget({ cx: cx ?? 200, cy: cy ?? 200 });
    setExiting(true);
    setTimeout(() => {
      onEnter(trackId);
    }, 1200);
  };

  return (
    <div className="splash" data-exiting={exiting || undefined} style={{ backgroundColor: '#050505' }}>
      <Starfield />
      {/* Oversized background engraving */}
      <SplashEngraving />

      <div className="splash-frame">
        <SignalTicker
          onSelectTrack={(id) => handleEnter(id)}
          onOpenPass={() => onOpenPass()}
        />
        
        <div className="splash-main-grid">
          
          {/* Zone 1: Editorial Information */}
          <div className="splash-zone-editorial">
            <header className="splash-identity">
              <h1 className="splash-title">ODUVIL<span className="wordmark-dot">.</span></h1>
              <div className="splash-tagline">Finally.</div>
              <div className="splash-notation">
                AN EP BY PINA COLADA BLUES · NOVEMBER 19<br/>
                OBSERVATION DATA: FROM A SUPERNOVA FAR AWAY
              </div>
            </header>
          </div>

          {/* Zone 2: Celestial Artwork */}
          <div className="splash-zone-art">
            <SplashDiagram onSelect={handleEnter} zoomTarget={zoomTarget} />
          </div>
          
          {/* Zone 3: Release/Discovery Action */}
          <div className="splash-zone-action">
            <button 
              className="splash-enter" 
              onClick={() => handleEnter()}
              aria-label="Enter the Observatory preview"
            >
              <span className="splash-enter-text">ENTER PREVIEW</span>
              <svg className="splash-enter-arrow" width="32" height="8" viewBox="0 0 32 8" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M0,4 L30,4 M27,1 L31,4 L27,7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>

        {/* Lower Region: Countdown, Pre-saves, Socials */}
        <footer className="splash-lower">
          <div className="splash-lower-left">
            <Countdown />
          </div>
          
          <div className="splash-lower-center">
            <div className="splash-presaves-wrapper">
              <div className="splash-presave-label">BE THERE FROM THE FIRST NOTE</div>
              <PresaveTelemetry onOpenPass={() => onOpenPass()} />
              <div className="splash-presaves-editorial">
                <a 
                  className="link-presave" 
                  href={SPOTIFY_PRESAVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pre-save ODUVIL on Spotify"
                  onClick={() => telemetry.recordPresave('spotify')}
                >
                  <SpotifyIcon />
                  <span className="link-presave-name">SPOTIFY</span>
                  <span className="link-presave-meta">PRE-SAVE</span>
                  <svg className="link-presave-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                    <path d="M1 9L9 1M9 1H3M9 1V7" strokeWidth="1" strokeLinecap="square" />
                  </svg>
                </a>
                
                <div className="link-presave-divider" aria-hidden="true" />

                <a 
                  className="link-presave" 
                  href={APPLE_MUSIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pre-add ODUVIL on Apple Music"
                  onClick={() => telemetry.recordPresave('apple')}
                >
                  <AppleMusicIcon />
                  <span className="link-presave-name">APPLE MUSIC</span>
                  <span className="link-presave-meta">PRE-ADD</span>
                  <svg className="link-presave-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                    <path d="M1 9L9 1M9 1H3M9 1V7" strokeWidth="1" strokeLinecap="square" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="splash-lower-right">
            <div className="splash-socials">
              <a href="https://open.spotify.com/artist/1pSV6wx1cZQB3l7c2wY3mE?si=sUsTB4DtTFmNoDkT2BDUYA" target="_blank" rel="noopener noreferrer" className="btn-social" aria-label="Spotify Artist">
                <SpotifyIcon />
              </a>
              <a href={APPLE_MUSIC_ARTIST_URL} target="_blank" rel="noopener noreferrer" className="btn-social" aria-label="Apple Music Artist">
                <AppleMusicIcon />
              </a>
              <a href="https://www.instagram.com/pinacoladablues/" target="_blank" rel="noopener noreferrer" className="btn-social" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://www.youtube.com/channel/UCDN245EpG_0XHioXb0E1kYg" target="_blank" rel="noopener noreferrer" className="btn-social" aria-label="YouTube">
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
