import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ExperienceMode, HotspotInfo, MotorcycleTelemetry } from './data/types';
import { HOTSPOTS } from './data/motorcycleSpecs';
import { engineAudio } from './audio/EngineAudio';

// 3D Components
import { MotorcycleModel } from './components/3d/MotorcycleModel';
import { StudioScene } from './components/3d/StudioScene';
import { RideScene } from './components/3d/RideScene';
import { HandlebarCockpit } from './components/3d/HandlebarCockpit';
import { CameraManager } from './components/3d/CameraManager';
import { Explore3DHotspots } from './components/3d/Explore3DHotspots';

// UI Components
import { Navbar } from './components/ui/Navbar';
import { HeroOverlay } from './components/ui/HeroOverlay';
import { IntroSequenceOverlay } from './components/ui/IntroSequenceOverlay';
import { ModeSelector } from './components/ui/ModeSelector';
import { RideHUD } from './components/ui/RideHUD';
import { ThrottleOverlay } from './components/ui/ThrottleOverlay';
import { ExploreOverlay } from './components/ui/ExploreOverlay';
import { EngineeringOverlay } from './components/ui/EngineeringOverlay';
import { SpecsModal } from './components/ui/SpecsModal';
import { StorySections } from './components/ui/StorySections';

export const App: React.FC = () => {
  // App Navigation & Experience Mode
  const [mode, setMode] = useState<ExperienceMode>('hero');
  const [introProgress, setIntroProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [specsModalOpen, setSpecsModalOpen] = useState(false);

  // Explore Mode State
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotInfo | null>(null);

  // Engineering Mode State
  const [selectedEngComponent, setSelectedEngComponent] = useState('engine');
  const [explodedProgress, setExplodedProgress] = useState(0);

  // Real-time Motorcycle Physics & Telemetry
  const [telemetry, setTelemetry] = useState<MotorcycleTelemetry>({
    speed: 0,
    rpm: 1400,
    gear: 'N',
    throttle: 0,
    brake: 0,
    leanAngle: 0,
    headlightsOn: true,
    engineRunning: false,
  });

  // State refs for animation loops without closure capture
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Track intro animation frame
  const introAnimFrame = useRef<number | null>(null);
  const introStartTime = useRef<number>(0);

  // Gear Calculation Helper
  const calculateGearAndSpeed = useCallback(
    (curSpeed: number, throttle: number, brake: number, delta: number) => {
      let speed = curSpeed;

      // Acceleration / Deceleration
      if (throttle > 0) {
        const accelPower = 35 * throttle; // km/h per sec
        speed = Math.min(299, speed + accelPower * delta);
      } else {
        // Natural rolling resistance / air drag
        const drag = 8 + (speed * speed) / 800;
        speed = Math.max(0, speed - drag * delta);
      }

      if (brake > 0) {
        speed = Math.max(0, speed - 85 * brake * delta);
      }

      // Determine Gear based on speed
      let gear: number | string = 'N';
      let rpm = 1400;

      if (speed < 2 && throttle === 0) {
        gear = 'N';
        rpm = 1400;
      } else if (speed < 70) {
        gear = 1;
        rpm = 1500 + (speed / 70) * 11500;
      } else if (speed < 120) {
        gear = 2;
        rpm = 4500 + ((speed - 70) / 50) * 8500;
      } else if (speed < 170) {
        gear = 3;
        rpm = 5500 + ((speed - 120) / 50) * 7500;
      } else if (speed < 220) {
        gear = 4;
        rpm = 6500 + ((speed - 170) / 50) * 6500;
      } else if (speed < 265) {
        gear = 5;
        rpm = 7500 + ((speed - 220) / 45) * 5500;
      } else {
        gear = 6;
        rpm = 8500 + ((speed - 265) / 35) * 5000;
      }

      // Add instant throttle response to RPM
      if (throttle > 0 && speed < 10) {
        rpm = Math.max(rpm, 1400 + throttle * 11000);
      }

      rpm = Math.min(13800, Math.max(1300, rpm));

      return { speed, gear, rpm };
    },
    []
  );

  // Main Physics Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const current = telemetryRef.current;
      const currentMode = modeRef.current;

      // Handle throttle & speed updates depending on mode
      if (currentMode === 'ride') {
        const { speed, gear, rpm } = calculateGearAndSpeed(
          current.speed,
          current.throttle,
          current.brake,
          delta
        );

        // Update audio synthesizer
        engineAudio.setRPM(rpm, current.throttle);

        setTelemetry((prev) => ({
          ...prev,
          speed,
          gear,
          rpm,
        }));
      } else if (currentMode === 'throttle') {
        // Direct responsive RPM physics in throttle mode
        const targetRPM = 1400 + current.throttle * 12100;
        const rpm = current.rpm + (targetRPM - current.rpm) * 0.2;
        
        // Simulated speed response
        const targetSpeed = current.throttle * 220;
        const speed = current.speed + (targetSpeed - current.speed) * 0.05;
        const gear = speed > 160 ? 5 : speed > 100 ? 4 : speed > 50 ? 3 : speed > 10 ? 2 : 1;

        engineAudio.setRPM(rpm, current.throttle);

        setTelemetry((prev) => ({
          ...prev,
          rpm,
          speed,
          gear,
        }));
      } else {
        // Idle state in hero/explore/engineering
        if (current.rpm > 1400) {
          const rpm = current.rpm + (1400 - current.rpm) * 0.1;
          engineAudio.setRPM(rpm, 0);
          setTelemetry((prev) => ({ ...prev, rpm }));
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [calculateGearAndSpeed]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          setMode('ride');
          break;
        case '2':
          setMode('throttle');
          break;
        case '3':
          setMode('explore');
          break;
        case '4':
          setMode('engineering');
          break;
        case 'Escape':
          if (specsModalOpen) {
            setSpecsModalOpen(false);
          } else if (selectedHotspot) {
            setSelectedHotspot(null);
          } else {
            setMode('hero');
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (mode === 'ride') {
            setTelemetry((prev) => ({ ...prev, leanAngle: Math.max(-28, prev.leanAngle - 3) }));
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (mode === 'ride') {
            setTelemetry((prev) => ({ ...prev, leanAngle: Math.min(28, prev.leanAngle + 3) }));
          }
          break;
        case 'm':
        case 'M':
          handleToggleMute();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') {
        // Auto-center lean angle
        setTelemetry((prev) => ({ ...prev, leanAngle: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [specsModalOpen, selectedHotspot, mode]);

  // Sound Toggle Handler
  const handleToggleMute = () => {
    const nextMuted = engineAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Coordinated Start Experience Animation Sequence
  const handleStartExperience = () => {
    setMode('intro');
    setIntroProgress(0);
    introStartTime.current = performance.now();

    // Initialize Web Audio API on user gesture
    engineAudio.init();

    const duration = 5200; // 5.2 seconds sequence

    const step = (now: number) => {
      const elapsed = now - introStartTime.current;
      const progress = Math.min(1, elapsed / duration);
      setIntroProgress(progress);

      // Trigger starter motor sound & ignition at ~30% progress
      if (progress >= 0.28 && !telemetryRef.current.engineRunning) {
        setTelemetry((prev) => ({ ...prev, engineRunning: true, headlightsOn: true }));
        engineAudio.playStarterSequence(() => {
          setTelemetry((prev) => ({ ...prev, rpm: 3500 }));
        });
      }

      if (progress < 1) {
        introAnimFrame.current = requestAnimationFrame(step);
      } else {
        // Transition seamlessly into RIDE mode
        setMode('ride');
        setTelemetry((prev) => ({
          ...prev,
          speed: 85,
          gear: 2,
          rpm: 5400,
        }));
      }
    };

    introAnimFrame.current = requestAnimationFrame(step);
  };

  // Skip Intro
  const handleSkipIntro = () => {
    if (introAnimFrame.current) {
      cancelAnimationFrame(introAnimFrame.current);
    }
    engineAudio.init();
    if (!engineAudio.getIsRunning()) {
      engineAudio.startContinuousEngine(5200);
    }
    setMode('ride');
    setTelemetry((prev) => ({
      ...prev,
      engineRunning: true,
      headlightsOn: true,
      speed: 85,
      gear: 2,
      rpm: 5400,
    }));
  };

  // Restart Experience
  const handleRestartExperience = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMode('hero');
    setTelemetry({
      speed: 0,
      rpm: 1400,
      gear: 'N',
      throttle: 0,
      brake: 0,
      leanAngle: 0,
      headlightsOn: true,
      engineRunning: false,
    });
    setSelectedHotspot(null);
    setExplodedProgress(0);
  };

  // Mode Selection helper
  const handleSelectMode = (newMode: ExperienceMode) => {
    setMode(newMode);
    setSelectedHotspot(null);
    if (newMode === 'ride' || newMode === 'throttle') {
      engineAudio.init();
      if (!engineAudio.getIsRunning()) {
        engineAudio.startContinuousEngine(1400);
      }
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08090b] text-white overflow-x-hidden select-none">
      {/* Universal Top Navigation */}
      <Navbar
        currentMode={mode}
        onSelectMode={handleSelectMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSpecs={() => setSpecsModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* ================= 3D VIEWPORT CANVAS ================= */}
      <div className="relative w-full h-screen overflow-hidden">
        <Canvas
          shadows
          camera={{ position: [2.4, 1.25, 2.5], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* Smooth Camera Manager */}
          <CameraManager
            mode={mode}
            introProgress={introProgress}
            selectedHotspot={selectedHotspot}
            speed={telemetry.speed}
            leanAngle={telemetry.leanAngle}
          />

          {/* Orbit Controls (Enabled in explore mode when not locked on hotspot) */}
          <OrbitControls
            enabled={mode === 'explore' && !selectedHotspot}
            enablePan={false}
            minDistance={1.8}
            maxDistance={5.5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2 - 0.05}
            dampingFactor={0.05}
          />

          {/* Mode-Specific 3D Environments */}
          {mode === 'ride' ? (
            <RideScene speed={telemetry.speed} />
          ) : (
            <StudioScene showRotationRing={mode === 'explore'} />
          )}

          {/* 3D Motorcycle Model */}
          {mode !== 'throttle' && (
            <MotorcycleModel
              telemetry={telemetry}
              explodedProgress={mode === 'engineering' ? explodedProgress : 0}
              highlightedPart={
                mode === 'explore'
                  ? selectedHotspot?.id || null
                  : mode === 'engineering'
                  ? selectedEngComponent
                  : null
              }
            />
          )}

          {/* 3D Cockpit Model in Throttle Mode */}
          {mode === 'throttle' && (
            <HandlebarCockpit
              rpm={telemetry.rpm}
              speed={telemetry.speed}
              gear={telemetry.gear}
              throttle={telemetry.throttle}
            />
          )}

          {/* 3D Interactive Hotspots in Explore Mode */}
          {mode === 'explore' && (
            <Explore3DHotspots
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
            />
          )}
        </Canvas>

        {/* ================= MODE INTERACTIVE UI OVERLAYS ================= */}
        {mode === 'hero' && (
          <HeroOverlay
            onStartExperience={handleStartExperience}
            onScrollToNext={() => scrollToSection('story-ride')}
          />
        )}

        {mode === 'intro' && (
          <IntroSequenceOverlay
            progress={introProgress}
            onSkip={handleSkipIntro}
          />
        )}

        {mode !== 'hero' && mode !== 'intro' && (
          <ModeSelector
            currentMode={mode}
            onSelectMode={handleSelectMode}
            onBackToMenu={() => setMode('hero')}
          />
        )}

        {mode === 'ride' && (
          <RideHUD
            telemetry={telemetry}
            onThrottlePress={() => setTelemetry((prev) => ({ ...prev, throttle: 0.85 }))}
            onThrottleRelease={() => setTelemetry((prev) => ({ ...prev, throttle: 0 }))}
            onBrakePress={() => setTelemetry((prev) => ({ ...prev, brake: 0.9 }))}
            onBrakeRelease={() => setTelemetry((prev) => ({ ...prev, brake: 0 }))}
          />
        )}

        {mode === 'throttle' && (
          <ThrottleOverlay
            telemetry={telemetry}
            onThrottleChange={(val) => setTelemetry((prev) => ({ ...prev, throttle: val }))}
            onQuickRev={() => {
              engineAudio.triggerShiftPop();
              setTelemetry((prev) => ({ ...prev, rpm: Math.min(13500, prev.rpm + 4000) }));
            }}
          />
        )}

        {mode === 'explore' && (
          <ExploreOverlay
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            onResetCamera={() => setSelectedHotspot(null)}
          />
        )}

        {mode === 'engineering' && (
          <EngineeringOverlay
            selectedComponentId={selectedEngComponent}
            onSelectComponent={setSelectedEngComponent}
            explodedProgress={explodedProgress}
            onExplodedChange={setExplodedProgress}
            onOpenFullSpecs={() => setSpecsModalOpen(true)}
          />
        )}
      </div>

      {/* ================= FULL PAGE STORYTELLING SECTIONS ================= */}
      <StorySections
        onSelectMode={handleSelectMode}
        onOpenSpecs={() => setSpecsModalOpen(true)}
        onRestartExperience={handleRestartExperience}
      />

      {/* Full Concept Specifications Modal */}
      <SpecsModal
        isOpen={specsModalOpen}
        onClose={() => setSpecsModalOpen(false)}
      />
    </div>
  );
};
