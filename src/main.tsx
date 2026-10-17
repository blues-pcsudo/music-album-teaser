import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/instrument-sans';
import './styles/reset.css';
import './styles/theme.css';
import './styles/typography.css';
import './styles/symbols.css';
import './styles/layout.css';
import './styles/controls.css';
import './styles/room.css';
import './styles/splash.css';
import './styles/intro.css';
import './styles/telemetry.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
