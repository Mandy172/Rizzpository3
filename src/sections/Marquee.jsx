import { useInRange, STAGES } from './useAnatomy.js';

const TXT = 'BUILT TO BE TAKEN APART // RACE BRED // PARALLEL-TWIN 457 // '.repeat(4);
const Row = ({ cls, rev }) => (
  <div className={`mq__row ${cls}`}>
    <div className={`mq__track ${rev ? 'rev' : ''}`}><span>{TXT}</span><span aria-hidden="true">{TXT}</span></div>
  </div>
);

export default function Marquee() {
  const on = useInRange(STAGES.marquee);
  return (
    <section className={`mq ${on ? 'is-on' : ''}`} aria-hidden="true">
      <Row cls="mq__row--fill" />
      <Row cls="mq__row--line" rev />
    </section>
  );
}
