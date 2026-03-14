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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">🍜</div>
          <h1 className="text-3xl font-bold text-gray-900">음식 사진 AI 보정</h1>
          <p className="text-gray-500">
            메뉴판용 음식 사진을 Gemini AI로 더 맛있게 보정해드려요
          </p>
        </div>

        {/* Upload */}
        <UploadZone onFileReady={handleFileReady} disabled={isProcessing} />

        {/* Controls — shown when file is uploaded */}
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 font-medium text-sm">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm text-red-500 underline hover:no-underline"
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
        <p className="text-center text-xs text-gray-400">
          Powered by Google Gemini API
        </p>
      </div>
    </main>
  );
}
