'use client';

import { useState } from 'react';
import { PLATFORM_OPTIONS, PlatformId, PlatformOption } from '@/types';

interface ResultPanelProps {
  enhancedBase64: string;
  mimeType: string;
  description?: string;
  onRetry: () => void;
}

async function downloadWithSize(base64: string, mimeType: string, platform: PlatformOption) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = platform.width;
      canvas.height = platform.height;
      const ctx = canvas.getContext('2d')!;
      const targetRatio = platform.width / platform.height;
      const srcRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
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

const PLATFORM_GRADIENTS: Record<PlatformId, string> = {
  baemin:    'linear-gradient(135deg, #6ee7b7, #10b981)',
  coupang:   'linear-gradient(135deg, #fde68a, #f59e0b)',
  naver:     'linear-gradient(135deg, #86efac, #22c55e)',
  instagram: 'linear-gradient(135deg, #f9a8d4, #db2777)',
};

export default function ResultPanel({ enhancedBase64, mimeType, description, onRetry }: ResultPanelProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('baemin');
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    const platform = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)!;
    setDownloading(true);
    await downloadWithSize(enhancedBase64, mimeType, platform);
    setDownloading(false);
  }

  function handleDownloadOriginal() {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${enhancedBase64}`;
    link.download = `food-retouch-original-${Date.now()}.png`;
    link.click();
  }

  const activePlatform = PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform)!;

  return (
    <div className="space-y-3">
      {/* AI 보정 내역 */}
      {description && (
        <div
          className="rounded-[28px] p-5 backdrop-blur-xl shadow-clay-card"
          style={{ background: 'rgba(255,255,255,0.7)' }}
        >
          <p className="text-[10px] uppercase tracking-widest font-bold mb-2"
            style={{ color: '#7C3AED', fontFamily: 'DM Sans, sans-serif' }}>
            AI 보정 내역
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#635F69', fontFamily: 'DM Sans, sans-serif' }}>
            {description}
          </p>
        </div>
      )}

      {/* Platform Download */}
      <div
        className="rounded-[32px] p-5 space-y-3.5 backdrop-blur-xl shadow-clay-card"
        style={{ background: 'rgba(255,255,255,0.7)' }}
      >
        <p className="text-[10px] uppercase tracking-widest font-bold"
          style={{ color: '#635F69', fontFamily: 'DM Sans, sans-serif' }}>
          플랫폼별 다운로드
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {PLATFORM_OPTIONS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className="relative p-3 rounded-[20px] text-left transition-all duration-200 active:scale-[0.94]"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(244,241,250,0.6)',
                  boxShadow: isSelected
                    ? '12px 12px 24px rgba(139,92,246,0.2), -8px -8px 16px rgba(255,255,255,0.9), inset 3px 3px 6px rgba(255,255,255,0.5), inset -3px -3px 6px rgba(0,0,0,0.05)'
                    : 'inset 6px 6px 12px rgba(180,170,200,0.12), inset -6px -6px 12px rgba(255,255,255,0.7)',
                  transform: isSelected ? 'translateY(-1px)' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: isSelected ? PLATFORM_GRADIENTS[platform.id] : 'rgba(200,190,220,0.3)',
                      boxShadow: isSelected ? '4px 4px 8px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {platform.emoji}
                  </div>
                  {isSelected && (
                    <div
                      className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}
                    >
                      <span className="text-white text-[9px]">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                  {platform.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#635F69' }}>
                  {platform.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 rounded-[20px] font-black text-sm text-white transition-all duration-200"
          style={{
            fontFamily: 'Nunito, sans-serif',
            background: downloading
              ? 'rgba(200,190,220,0.5)'
              : 'linear-gradient(135deg, #A78BFA, #7C3AED)',
            boxShadow: downloading
              ? 'inset 8px 8px 16px rgba(180,170,200,0.2)'
              : '12px 12px 24px rgba(139,92,246,0.3), -8px -8px 16px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(255,255,255,0.4), inset -4px -4px 8px rgba(0,0,0,0.1)',
            cursor: downloading ? 'not-allowed' : 'pointer',
            color: downloading ? '#635F69' : '#fff',
          }}
        >
          {downloading
            ? '변환 중...'
            : `${activePlatform.emoji} ${activePlatform.label}용 다운로드 (${activePlatform.width}×${activePlatform.height})`}
        </button>

        {/* Original download */}
        <button
          onClick={handleDownloadOriginal}
          className="w-full py-3 rounded-[20px] text-xs font-bold transition-all duration-200 active:scale-[0.96]"
          style={{
            background: 'rgba(244,241,250,0.6)',
            color: '#635F69',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: 'inset 6px 6px 12px rgba(180,170,200,0.15), inset -6px -6px 12px rgba(255,255,255,0.8)',
          }}
        >
          원본 사이즈로 다운로드
        </button>
      </div>

      {/* Retry */}
      <button
        onClick={onRetry}
        className="w-full py-4 rounded-[20px] font-bold text-sm transition-all duration-200 active:scale-[0.94]"
        style={{
          background: 'rgba(255,255,255,0.7)',
          color: '#635F69',
          fontFamily: 'Nunito, sans-serif',
          boxShadow: '16px 16px 32px rgba(160,150,180,0.2), -10px -10px 24px rgba(255,255,255,0.9), inset 6px 6px 12px rgba(139,92,246,0.03), inset -6px -6px 12px rgba(255,255,255,1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        다시 보정하기
      </button>
    </div>
  );
}
