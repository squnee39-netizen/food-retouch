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

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Touch events for mobile
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
    <div className="rounded-2xl overflow-hidden shadow-lg">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] select-none cursor-col-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Before image (base layer) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt="원본"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* After image (clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt="보정 후"
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${(100 / position) * 100}%`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ left: `calc(${position}% - 1px)` }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center gap-0.5"
          style={{ left: `${position}%` }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 2L1 7L4 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 2L13 7L10 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">원본</div>
        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">AI 보정</div>
      </div>
    </div>
  );
}
