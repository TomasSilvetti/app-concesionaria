"use client";

import { useEffect, useRef } from "react";

interface PlasmaProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  className?: string;
}

export function Plasma({
  speed = 0.006,
  scale = 1.5,
  brightness = 0.85,
  className = "",
}: PlasmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const palette = (v: number): [number, number, number] => {
      // Almost pure black, with barely perceptible grey highlights
      const b = brightness;
      const grey = Math.round(v * v * 28 * b); // very compressed, max ~28
      return [grey, grey, grey];
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      tRef.current += speed;
      const t = tRef.current;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      const s = scale;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = (x / w) * s;
          const ny = (y / h) * s;

          const v =
            Math.sin(nx * 3 + t) +
            Math.sin(ny * 3 + t * 0.9) +
            Math.sin((nx + ny) * 2.5 + t * 1.1) +
            Math.sin(Math.sqrt(nx * nx + ny * ny) * 4 + t * 0.7);

          const norm = (v / 4 + 1) / 2; // 0..1
          const [r, g, b] = palette(norm);

          const idx = (y * w + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [speed, scale, brightness]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
