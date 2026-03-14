'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import RetouchControls from '@/components/RetouchControls';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ResultPanel from '@/components/ResultPanel';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AppState, RetouchStyle, RetouchResponse } from '@/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [originalBase64, setOriginalBase64] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/jpeg');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RetouchStyle>('appetizing');
  const [result, setResult] = useState<RetouchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleFileReady(base64: string, mimeType: string, previewUrl: string) {
    setOriginalBase64(base64);
    setOriginalMimeType(mimeType);
    setOriginalPreviewUrl(previewUrl);
    setResult(null);
    setAppState('idle');
    setErrorMessage(null);
  }

  async function handleRetouch() {
    if (!originalBase64) return;
    setAppState('processing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/retouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalBase64,
          mimeType: originalMimeType,
          style: selectedStyle,
        }),
      });
      const data: RetouchResponse = await res.json();
      if (data.success) {
        setResult(data);
        setAppState('done');
      } else {
        setErrorMessage(data.error ?? '보정에 실패했습니다.');
        setAppState('error');
      }
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setAppState('error');
    }
  }

  function handleRetry() {
    setResult(null);
    setAppState('idle');
    setErrorMessage(null);
  }

  const isProcessing = appState === 'processing';
  const hasFile = !!originalBase64;

  return (
    <main className="min-h-screen bg-[#0A0A0A]">

      {/* ── Liquid Hero Section ── */}
      <section
        className="bg-[#FDE047] px-6 pt-10 pb-20"
        style={{ borderRadius: '0 0 80px 40px' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <span className="text-[10px] uppercase tracking-widest font-medium text-black/40">
              AI Food Studio
            </span>
            <span className="bg-black text-[#FDE047] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-semibold">
              Gemini AI
            </span>
          </div>

          <h1 className="text-7xl font-bold text-[#0A0A0A] tracking-tight leading-[0.9]">
            음식 사진<br />AI 보정
          </h1>
          <p className="mt-5 text-black/50 text-sm leading-relaxed max-w-xs">
            메뉴판용 음식 사진을 전문 푸드포토그래퍼 수준으로 보정해드립니다
          </p>
        </div>
      </section>

      {/* ── Dark Void Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Upload */}
        <UploadZone onFileReady={handleFileReady} disabled={isProcessing} />

        {/* Controls */}
        {hasFile && !isProcessing && appState !== 'done' && (
          <RetouchControls
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            onRetouch={handleRetouch}
            disabled={isProcessing}
          />
        )}

        {/* Loading */}
        {isProcessing && <LoadingOverlay />}

        {/* Error */}
        {appState === 'error' && errorMessage && (
          <div className="bg-white/5 border border-red-500/30 rounded-[32px] p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">⚠</span>
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-medium text-sm">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-xs text-white/40 hover:text-[#FDE047] transition-colors underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {appState === 'done' && result?.enhancedImageBase64 && originalPreviewUrl && (
          <div className="space-y-4">
            <BeforeAfterSlider
              beforeUrl={originalPreviewUrl}
              afterBase64={result.enhancedImageBase64}
              afterMimeType={result.mimeType ?? 'image/png'}
            />
            <ResultPanel
              enhancedBase64={result.enhancedImageBase64}
              mimeType={result.mimeType ?? 'image/png'}
              description={result.description}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest pt-4">
          Powered by Google Gemini API
        </p>
      </div>
    </main>
  );
}
