import { useEffect } from 'react';
import { decodeFrame, signalSeed } from '../domain/decode';
import SignalBands from './SignalBands';
import useSignalBurst from './useSignalBurst';

export default function DecodePhrase({ text, motion, revealKey }) {
  const seed = signalSeed(`${revealKey ?? ''}:${text}`);
  const { tick, start } = useSignalBurst(motion, 550, 11);
  const decoding = motion && tick >= 0;
  const frame = decoding ? decodeFrame(text, tick, { steps: 10, seed }) : text;

  useEffect(() => {
    if (motion) start();
  }, [motion, revealKey, start]);

  return <span className="decode-phrase" data-decoding={decoding ? 'true' : 'false'}>
    <span className="decode-phrase__source">{text}</span>
    {decoding && <span className="decode-phrase__overlay" aria-hidden="true">
      <span className="decode-phrase__frame">{frame}</span>
      <SignalBands seed={seed} tick={tick} className="decode-phrase__signals">
        <span className="decode-phrase__frame">{frame}</span>
      </SignalBands>
    </span>}
  </span>;
}
