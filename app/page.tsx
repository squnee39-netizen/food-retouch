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
        body: JSON.stringify({ imageBase64: originalBase64, mimeType: originalMimeType, style: selectedStyle }),
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
    <main className="min-h-screen" style={{ background: '#F4F1FA' }}>

      {/* ── Floating Background Blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl animate-clay-float"
          style={{ background: 'rgba(139,92,246,0.1)', top: '-10%', left: '-10%' }} />
        <div className="absolute h-[50vh] w-[50vh] rounded-full blur-3xl animate-clay-float-delayed"
          style={{ background: 'rgba(219,39,119,0.08)', top: '20%', right: '-10%' }} />
        <div className="absolute h-[45vh] w-[45vh] rounded-full blur-3xl animate-clay-float-slow"
          style={{ background: 'rgba(14,165,233,0.08)', bottom: '5%', left: '20%' }} />
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-5">

        {/* ── Hero Header ── */}
        <div className="text-center space-y-3 pb-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-clay-button"
            style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', fontFamily: 'DM Sans, sans-serif' }}>
            <span className="text-sm">✨</span>
            <span className="text-white text-xs font-bold tracking-wide uppercase">Gemini AI</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight leading-[1.1]"
            style={{ fontFamily: 'Nunito, sans-serif', color: '#332F3A' }}>
            음식 사진<br />
            <span style={{ background: 'linear-gradient(135deg, #7C3AED 20%, #DB2777 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI 보정
            </span>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#635F69', fontFamily: 'DM Sans, sans-serif' }}>
            메뉴판용 음식 사진을 전문 푸드포토그래퍼 수준으로 보정해드립니다
          </p>
        </div>

        {/* ── Upload Zone ── */}
        <UploadZone onFileReady={handleFileReady} disabled={isProcessing} />

        {/* ── Retouch Controls ── */}
        {hasFile && !isProcessing && appState !== 'done' && (
          <RetouchControls
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            onRetouch={handleRetouch}
            disabled={isProcessing}
          />
        )}

        {/* ── Loading ── */}
        {isProcessing && <LoadingOverlay />}

        {/* ── Error ── */}
        {appState === 'error' && errorMessage && (
          <div className="rounded-[28px] p-5 flex items-start gap-4 backdrop-blur-xl shadow-clay-card"
            style={{ background: 'rgba(255,255,255,0.7)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-clay-button"
              style={{ background: 'linear-gradient(135deg, #fca5a5, #ef4444)' }}>
              <span className="text-white text-sm">⚠</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#ef4444', fontFamily: 'Nunito, sans-serif' }}>
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="mt-2 text-xs font-medium underline underline-offset-2 transition-colors"
                style={{ color: '#7C3AED' }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* ── Result ── */}
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

        {/* ── Footer ── */}
        <p className="text-center text-[10px] uppercase tracking-widest pb-4" style={{ color: '#635F69', opacity: 0.5 }}>
          Powered by Google Gemini API
        </p>
      </div>
    </main>
  );
}
