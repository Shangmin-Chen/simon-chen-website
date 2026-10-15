export default function AmbientScene() {
  return <div className="scene-ambient" aria-hidden="true">
    <span className="scene-ambient__route scene-ambient__route--upper" />
    <span className="scene-ambient__route scene-ambient__route--lower" />
    <span className="scene-ambient__route scene-ambient__route--return" />
    <span className="scene-ambient__packet scene-ambient__packet--cyan" />
    <span className="scene-ambient__packet scene-ambient__packet--pink" />
    <span className="scene-ambient__bracket scene-ambient__bracket--left">+</span>
    <span className="scene-ambient__bracket scene-ambient__bracket--right">{'//'}</span>
    <span className="scene-ambient__shard scene-ambient__shard--one" />
    <span className="scene-ambient__shard scene-ambient__shard--two" />
    <span className="scene-ambient__assembly">
      <span className="scene-ambient__assembly-fragment scene-ambient__assembly-fragment--nw" />
      <span className="scene-ambient__assembly-fragment scene-ambient__assembly-fragment--ne" />
      <span className="scene-ambient__assembly-fragment scene-ambient__assembly-fragment--se" />
      <span className="scene-ambient__assembly-fragment scene-ambient__assembly-fragment--sw" />
      <span className="scene-ambient__assembly-mark">{'<>'}</span>
    </span>
  </div>;
}
