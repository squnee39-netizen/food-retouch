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
        relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed
        transition-all duration-200 cursor-pointer select-none overflow-hidden
        ${isDragging ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
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
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white font-medium text-sm">사진 변경하기</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          {loading ? (
            <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="text-5xl">📷</div>
          )}
          <p className="text-gray-600 font-medium">
            {loading ? '이미지 처리 중...' : '음식 사진을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="text-gray-400 text-sm">JPG, PNG, WEBP · 최대 20MB</p>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-sm text-center py-2">
          {error}
        </div>
      )}
    </div>
  );
}
