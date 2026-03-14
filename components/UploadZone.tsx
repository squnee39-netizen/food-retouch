'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { isAcceptedMimeType, resizeAndEncodeImage } from '@/lib/imageUtils';

interface UploadZoneProps {
  onFileReady: (base64: string, mimeType: string, previewUrl: string) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileReady, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function processFile(file: File) {
    setError(null);
    if (!isAcceptedMimeType(file.type)) {
      setError('JPG, PNG, WEBP 파일만 지원합니다.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('파일 크기는 20MB 이하여야 합니다.');
      return;
    }
    setLoading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      const { base64, mimeType } = await resizeAndEncodeImage(file);
      onFileReady(base64, mimeType, previewUrl);
    } catch {
      setError('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && !loading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center
        rounded-[32px] transition-all duration-300 cursor-pointer select-none overflow-hidden
        backdrop-blur-xl
        ${preview ? 'h-72' : 'h-60'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        background: isDragging
          ? 'rgba(124,58,237,0.08)'
          : 'rgba(255,255,255,0.7)',
        boxShadow: isDragging
          ? '16px 16px 32px rgba(124,58,237,0.15), -10px -10px 24px rgba(255,255,255,0.9), inset 10px 10px 20px rgba(124,58,237,0.08), inset -10px -10px 20px rgba(255,255,255,0.6)'
          : '16px 16px 32px rgba(160,150,180,0.2), -10px -10px 24px rgba(255,255,255,0.9), inset 6px 6px 12px rgba(139,92,246,0.03), inset -6px -6px 12px rgba(255,255,255,1)',
        outline: isDragging ? '2px solid rgba(124,58,237,0.4)' : '2px solid transparent',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="업로드된 음식 사진"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'rgba(124,58,237,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="px-5 py-2.5 rounded-full font-bold text-xs text-white shadow-clay-button"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', fontFamily: 'DM Sans, sans-serif' }}>
              📷 사진 변경하기
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          {loading ? (
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(124,58,237,0.3)', borderTopColor: '#7C3AED' }} />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl animate-clay-breathe"
              style={{
                background: 'linear-gradient(135deg, #C4B5FD, #7C3AED)',
                boxShadow: '12px 12px 24px rgba(139,92,246,0.3), -8px -8px 16px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(255,255,255,0.4)',
              }}
            >
              📷
            </div>
          )}
          <div>
            <p className="font-bold text-sm" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
              {loading ? '이미지 처리 중...' : '음식 사진을 드래그하거나 클릭'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#635F69' }}>JPG · PNG · WEBP · 최대 20MB</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 text-white text-xs text-center py-3 font-semibold rounded-b-[32px]"
          style={{ background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(8px)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
