import React, { Component } from 'react';
import Sections from './sections';
import { ThreeCanvas } from './three/ThreeCanvas.jsx';
import { HUDOverlay } from './hud/HUDOverlay.jsx';
import { ScrollContainer } from './sections/ScrollContainer.jsx';
import { Preloader, Cursor, PartNavigator } from './hud';
import EngineAudio from './audio/EngineAudio.jsx';
import Drive from './drive/Drive.jsx';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("WebGL Canvas error caught, continuing with fallback HUD:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 w-full h-full bg-bg flex items-center justify-center font-mono text-xs text-muted">
          <div className="border border-blueprint p-6 bg-surface text-center">
            <span className="text-accent font-bold block mb-2">[LOW-POWER / WEBGL 2D FALLBACK]</span>
            <span className="text-hud">TELEMETRY & HUD ACTIVE</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/drive') {
    return <Drive />;
  }

  return (
    <main className="relative w-full bg-bg text-text min-h-screen">
      <a
        href="/drive"
        aria-label="Open RS 660 arcade drive mode"
        style={{
          position: 'fixed', top: 16, right: 20, zIndex: 100,
          color: '#f2f2f0', border: '1px solid #e10600', padding: '10px 14px',
          font: "700 10px 'JetBrains Mono', monospace", letterSpacing: '.16em',
          textDecoration: 'none', background: 'rgba(5,5,5,.82)', pointerEvents: 'auto',
        }}
      >
        RS 660 DRIVE ↗
      </a>
      {/* Interactive custom crosshair cursor */}
      <Cursor />

      {/* Boot sequence preloader with 13k RPM arc sweep */}
      <Preloader />
      <EngineAudio />

      {/* 4. Fixed full-screen Three.js Canvas behind the DOM (z-index 0) */}
      <CanvasErrorBoundary>
        <ThreeCanvas />
      </CanvasErrorBoundary>

      <Sections />

      {/* Persistent Technical Telemetry HUD & Leader Line */}
      <HUDOverlay />

      {/* Right-edge part navigator */}
      <PartNavigator />

      {/* GSAP & Lenis Scroll Container with sections */}
      <ScrollContainer />
    </main>
  );
}
