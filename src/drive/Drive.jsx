// Drivable bike scene. Drop the GLB at public/models/aprilia-rs660.glb
// Needs: @react-three/fiber, @react-three/drei, @react-three/postprocessing, three (already in the repo).
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, KeyboardControls, useKeyboardControls, Environment, ContactShadows, Grid, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const MODEL = '/models/aprilia-rs660.glb';
const LABEL = 'APRILIA // RS 660';          // model is an RS 660, not a 457
const CREDIT = 'RS 660 model credit pending'; // replace with the creator and license before publishing
const MODEL_YAW = 0;                         // Math.PI if it drives backwards, ±Math.PI/2 if sideways
const KEYS = [
  { name: 'fwd', keys: ['KeyW', 'ArrowUp'] }, { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] }, { name: 'right', keys: ['KeyD', 'ArrowRight'] },
];

function Bike({ speedEl }) {
  const { scene } = useGLTF(MODEL);
  const [, get] = useKeyboardControls();
  const rig = useRef(), tilt = useRef();
  const st = useRef({ v: 0, yaw: 0, lean: 0 });

  useMemo(() => { // normalise size (~2.1u long) and sit the wheels on y=0
    const box = new THREE.Box3().setFromObject(scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const k = 2.1 / Math.max(size.x, size.z);
    scene.scale.setScalar(k);
    scene.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  }, [scene]);

  useFrame((state, dt) => {
    const { fwd, back, left, right } = get(), p = st.current, g = rig.current;
    p.v += (fwd ? 12 : back ? -16 : 0) * dt;
    if (!fwd && !back) p.v -= p.v * 1.2 * dt;
    p.v = THREE.MathUtils.clamp(p.v, -6, 45);
    const steer = (left ? 1 : 0) - (right ? 1 : 0), grip = Math.min(1, Math.abs(p.v) / 8);
    p.yaw += steer * grip * 1.6 * dt * (p.v < 0 ? -1 : 1);
    g.rotation.y = p.yaw;
    g.position.x += Math.sin(p.yaw) * p.v * dt;
    g.position.z += Math.cos(p.yaw) * p.v * dt;
    p.lean += (steer * 0.45 * Math.min(1, Math.abs(p.v) / 20) - p.lean) * Math.min(1, 6 * dt);
    tilt.current.rotation.z = -p.lean;

    const cam = state.camera, want = new THREE.Vector3(g.position.x - Math.sin(p.yaw) * 6, 2.4, g.position.z - Math.cos(p.yaw) * 6);
    cam.position.lerp(want, Math.min(1, 4 * dt));
    cam.lookAt(g.position.x, 0.9, g.position.z);
    cam.fov = 55 + Math.abs(p.v) * 0.35; cam.updateProjectionMatrix();
    if (speedEl.current) speedEl.current.textContent = Math.round(Math.abs(p.v) * 3.6);
  });

  return (
    <group ref={rig}>
      <group ref={tilt}><primitive object={scene} rotation-y={MODEL_YAW} /></group>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.7} blur={2.5} far={3} scale={8} />
    </group>
  );
}

function Loader() {
  const { progress, active } = useProgress();
  return (
    <div style={{ ...S.loader, clipPath: active ? 'inset(0)' : 'inset(0 0 100% 0)' }}>
      <div style={S.big}>{Math.round(progress)}%</div><div style={S.mono}>LOADING // {LABEL}</div>
    </div>
  );
}

export default function Drive() {
  const [modelAvailable, setModelAvailable] = useState(null);
  const speedEl = useRef();

  useEffect(() => {
    let cancelled = false;
    fetch(MODEL, { method: 'HEAD' })
      .then((response) => !cancelled && setModelAvailable(response.ok))
      .catch(() => !cancelled && setModelAvailable(false));
    return () => { cancelled = true; };
  }, []);

  if (modelAvailable !== true) {
    return (
      <main style={{ ...S.root, display: 'grid', placeContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ ...S.big, fontSize: 'clamp(48px, 10vw, 112px)' }}>RS 660 // DRIVE</div>
          <p style={{ ...S.mono, color: '#aaa', lineHeight: 1.8, margin: '20px auto' }}>
            {modelAvailable === false
              ? 'Add the legally downloadable RS 660 GLB at public/models/aprilia-rs660.glb to enable this scene.'
              : 'CHECKING FOR THE RS 660 MODEL…'}
          </p>
          <a href="https://sketchfab.com/3d-models/aprilia-rs-660-2024-9c150ae84c364ffcb09778bec610d17e" target="_blank" rel="noreferrer" style={{ ...S.mono, color: '#e10600' }}>
            MODEL SOURCE / CHECK LICENSE ↗
          </a>
          <div style={{ marginTop: 32 }}>
            <a href="/" style={{ ...S.mono, color: '#aaa' }}>← BACK TO RS 457 ANATOMY</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div style={S.root}>
      <KeyboardControls map={KEYS}>
        <Canvas camera={{ position: [0, 2.4, -6], fov: 55 }} dpr={[1, 1.75]}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 18, 70]} />
          <Suspense fallback={null}>
            <Environment preset="night" />
            <directionalLight position={[5, 8, 3]} intensity={1.2} />
            <Bike speedEl={speedEl} />
            <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={60} cellColor="#222" sectionColor="#e10600" />
            <EffectComposer><Bloom intensity={0.4} luminanceThreshold={0.8} /><Vignette darkness={0.7} /></EffectComposer>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      <div style={S.tag}>[01] {LABEL}</div>
      <div style={S.hint}>WASD / ARROWS TO DRIVE</div>
      <div style={S.speed}><span ref={speedEl}>0</span><small style={S.mono}> KM/H</small></div>
      <div style={S.credit}>{CREDIT} · Unofficial fan project, not affiliated with Aprilia.</div>
      <Loader />
    </div>
  );
}

const mono = "'JetBrains Mono',monospace";
const S = {
  root: { position: 'fixed', inset: 0, background: '#050505', color: '#f2f2f0', fontFamily: mono },
  tag: { position: 'absolute', top: 20, left: 20, font: `700 12px ${mono}`, letterSpacing: '.2em', color: '#e10600' },
  hint: { position: 'absolute', top: 20, right: 20, font: `400 11px ${mono}`, letterSpacing: '.2em', color: '#8a8a85' },
  speed: { position: 'absolute', bottom: 24, left: 20, font: "400 clamp(56px,10vw,140px)/1 'Anton',Impact,sans-serif" },
  mono: { font: `700 12px ${mono}`, letterSpacing: '.2em' },
  credit: { position: 'absolute', bottom: 8, right: 20, font: `400 9px ${mono}`, color: '#8a8a85', textAlign: 'right' },
  loader: { position: 'absolute', inset: 0, background: '#000', display: 'grid', placeContent: 'center', gap: 8, transition: 'clip-path .6s cubic-bezier(.76,0,.24,1)' },
  big: { font: "400 clamp(64px,14vw,200px)/1 'Anton',Impact,sans-serif", color: '#e10600' },
};
