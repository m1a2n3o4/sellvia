'use client';

import { useRef, useEffect, useState } from 'react';

interface SketchUnderlineProps {
  children: React.ReactNode;
  className?: string;
  strokeColor?: string;
  roughness?: number;
  strokeWidth?: number;
}

export function SketchUnderline({
  children,
  className = '',
  strokeColor = '#2563EB',
  roughness = 2,
  strokeWidth = 2.5,
}: SketchUnderlineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const draw = async () => {
      const roughModule = await import('roughjs');
      const rough = roughModule.default;
      if (cancelled) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const { width } = container.getBoundingClientRect();
      const lineHeight = 8;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = lineHeight * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${lineHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, lineHeight);
      }

      const rc = rough.canvas(canvas);
      rc.line(0, 4, width, 4, {
        stroke: strokeColor,
        roughness,
        strokeWidth,
        bowing: 0.5,
      });
      setReady(true);
    };

    draw();

    const observer = new ResizeObserver(() => draw());
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [strokeColor, roughness, strokeWidth]);

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      {children}
      <canvas
        ref={canvasRef}
        className={`absolute bottom-0 left-0 pointer-events-none transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </span>
  );
}
