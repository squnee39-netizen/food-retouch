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
        rounded-[32px] border transition-all duration-300 cursor-pointer select-none overflow-hidden
        backdrop-blur-xl
        ${isDragging
          ? 'border-[#FDE047] bg-[#FDE047]/10'
          : 'border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${preview ? 'h-72' : 'h-64'}
      `}
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-[#FDE047] text-black text-xs font-semibold px-4 py-2 rounded-full">
              사진 변경하기
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          {loading ? (
            <div className="w-10 h-10 border-2 border-[#FDE047] border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl animate-float">
              📷
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">
              {loading ? '이미지 처리 중...' : '음식 사진을 드래그하거나 클릭'}
            </p>
            <p className="text-white/30 text-xs mt-1">JPG · PNG · WEBP · 최대 20MB</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 backdrop-blur-sm text-white text-xs text-center py-2.5 font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
