import '../styles/anatomy.css';
import Frame from './Frame.jsx';
import Hero from './Hero.jsx';
import InfoPanel from './InfoPanel.jsx';
import StatSection from './StatSection.jsx';
import Marquee from './Marquee.jsx';
import Finale from './Finale.jsx';

// Mount once, above the fixed <Canvas/>: <Sections />
export default function Sections() {
  return (
    <div className="ov">
      <Frame /><Hero /><Marquee /><StatSection /><InfoPanel /><Finale />
    </div>
  );
}
