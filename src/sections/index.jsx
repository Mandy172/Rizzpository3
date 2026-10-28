import '../styles/anatomy.css';
import Frame from './Frame.jsx';
import Hero from './Hero.jsx';
import InfoPanel from './InfoPanel.jsx';
import StatSection from './StatSection.jsx';
import Marquee from './Marquee.jsx';
import Finale from './Finale.jsx';
import { useStore } from './useAnatomy.js';

// Mount once, above the fixed <Canvas/>: <Sections />
export default function Sections() {
  const inspectionMode = useStore((s) => s.inspectionMode);

  // When user enters 360° Inspection Mode, hide DOM story sections to allow unobstructed view
  if (inspectionMode) return null;

  return (
    <div className="ov">
      <Frame /><Hero /><Marquee /><StatSection /><InfoPanel /><Finale />
    </div>
  );
}
