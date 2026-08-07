import React, { useEffect, useRef, useState } from 'react';
import { decode } from 'blurhash';

const BlurhashImage = ({
  src,
  blurhash,
  alt = '',
  className = '',
  imgClassName = '',
  style = {},
  imgStyle = {},
  canvasWidth = 32,
  canvasHeight = 32,
  loading,
  draggable,
  width,
  height,
  onLoad,
  ...props
}) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!blurhash || !canvasRef.current) return;
    try {
      const pixels = decode(blurhash, canvasWidth, canvasHeight);
      const canvas = canvasRef.current;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(canvasWidth, canvasHeight);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
      }
    } catch (err) {
      console.warn('Blurhash decode error:', err);
    }
  }, [blurhash, canvasWidth, canvasHeight]);

  useEffect(() => {
    setLoaded(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth !== 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div
      className={`blurhash-container ${loaded ? 'is-loaded' : ''} ${className}`.trim()}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {blurhash && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="blurhash-canvas"
          style={{
            opacity: loaded ? 0 : 1,
          }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        draggable={draggable}
        width={width}
        height={height}
        onLoad={handleLoad}
        className={`blurhash-img ${imgClassName}`.trim()}
        style={{
          opacity: loaded ? 1 : 0,
          ...imgStyle,
        }}
        {...props}
      />
    </div>
  );
};

export default BlurhashImage;
