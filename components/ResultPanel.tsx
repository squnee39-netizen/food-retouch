'use client';

import { useState } from 'react';
import { PLATFORM_OPTIONS, PlatformId, PlatformOption } from '@/types';

interface ResultPanelProps {
  enhancedBase64: string;
  mimeType: string;
  description?: string;
  onRetry: () => void;
}

async function downloadWithSize(
  base64: string,
  mimeType: string,
  platform: PlatformOption
) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = platform.width;
      canvas.height = platform.height;
      const ctx = canvas.getContext('2d')!;

      // Center-crop to target aspect ratio, then scale
      const targetRatio = platform.width / platform.height;
      const srcRatio = img.width / img.height;

      let sx = 0, sy = 0, sw = img.width, sh = img.height;

      if (srcRatio > targetRatio) {
        // Image wider than target → crop sides
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        // Image taller than target → crop top/bottom
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, platform.width, platform.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `food-retouch-${platform.id}-${platform.width}x${platform.height}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, 'image/png');
    };
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

export default function ResultPanel({
  enhancedBase64,
  mimeType,
  description,
  onRetry,
}: ResultPanelProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('baemin');
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    const platform = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)!;
    setDownloading(true);
    await downloadWithSize(enhancedBase64, mimeType, platform);
    setDownloading(false);
  }

  async function handleDownloadOriginal() {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${enhancedBase64}`;
    link.download = `food-retouch-original-${Date.now()}.png`;
    link.click();
  }

  const activePlatform = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)!;

  return (
    <div className="space-y-3">
      {description && (
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#FDE047]/70 font-semibold mb-2">
            AI 보정 내역
          </p>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Platform Selector */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-4 space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-[#FDE047]/70 font-semibold">
          플랫폼별 다운로드
        </p>

        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                relative p-3 rounded-[18px] text-left transition-all duration-200 active:scale-95
                ${selectedPlatform === platform.id
                  ? 'bg-[#FDE047] text-black shadow-[0_4px_20px_rgba(253,224,71,0.25)]'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <span className="text-lg">{platform.emoji}</span>
              <p className={`text-xs font-bold mt-1 ${selectedPlatform === platform.id ? 'text-black' : 'text-white/80'}`}>
                {platform.label}
              </p>
              <p className={`text-[10px] mt-0.5 leading-tight ${selectedPlatform === platform.id ? 'text-black/50' : 'text-white/30'}`}>
                {platform.description}
              </p>
              {selectedPlatform === platform.id && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                  <span className="text-[#FDE047] text-[8px]">✓</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 rounded-full bg-[#FDE047] text-black font-bold text-sm tracking-wide
            hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(253,224,71,0.3)]
            active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100"
        >
          {downloading
            ? '변환 중...'
            : `${activePlatform.emoji} ${activePlatform.label}용 다운로드 (${activePlatform.width}×${activePlatform.height})`}
        </button>

        {/* Original Download */}
        <button
          onClick={handleDownloadOriginal}
          className="w-full py-3 rounded-full border border-white/10 text-white/40 text-xs
            hover:bg-white/5 hover:text-white/60 hover:border-white/20
            transition-all duration-200 active:scale-95"
        >
          원본 사이즈로 다운로드
        </button>
      </div>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="w-full px-5 py-4 rounded-full border border-white/15 text-white/50
          hover:bg-white/10 hover:text-white hover:border-white/30
          font-medium text-sm transition-all duration-200 active:scale-95"
      >
        다시 보정하기
      </button>
    </div>
  );
}
