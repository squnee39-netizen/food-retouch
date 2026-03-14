'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterBase64: string;
  afterMimeType: string;
}

export default function BeforeAfterSlider({ beforeUrl, afterBase64, afterMimeType }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => { isDragging.current = false; };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    };
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => container.removeEventListener('touchmove', handleTouchMove);
  }, [updatePosition]);

  const afterSrc = `data:${afterMimeType};base64,${afterBase64}`;

  return (
    <div
      className="overflow-hidden shadow-clay-card"
      style={{ borderRadius: '32px' }}
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] select-none cursor-col-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Before image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt="원본"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* After image (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt="보정 후"
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${(100 / position) * 100}%`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{
            left: `calc(${position}% - 1px)`,
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 12px rgba(124,58,237,0.4)',
          }}
        />

        {/* Clay handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            left: `${position}%`,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '8px 8px 16px rgba(139,92,246,0.25), -6px -6px 12px rgba(255,255,255,0.9), inset 3px 3px 6px rgba(255,255,255,0.6), inset -3px -3px 6px rgba(0,0,0,0.06)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 3L14 8L11 13" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Labels */}
        <div
          className="absolute top-3 left-3 text-white text-xs px-3 py-1.5 rounded-full font-bold"
          style={{
            background: 'rgba(50,45,60,0.7)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          원본
        </div>
        <div
          className="absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full font-bold"
          style={{
            background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
            boxShadow: '4px 4px 8px rgba(139,92,246,0.3)',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          AI 보정
        </div>
      </div>
    </div>
  );
}
