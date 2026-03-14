'use client';

import { RetouchStyle, STYLE_OPTIONS } from '@/types';

interface RetouchControlsProps {
  selectedStyle: RetouchStyle;
  onStyleChange: (style: RetouchStyle) => void;
  onRetouch: () => void;
  disabled?: boolean;
}

export default function RetouchControls({
  selectedStyle,
  onStyleChange,
  onRetouch,
  disabled,
}: RetouchControlsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-600">보정 스타일 선택</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onStyleChange(option.id)}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-left
              ${selectedStyle === option.id
                ? 'border-orange-400 bg-orange-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs font-semibold text-gray-800">{option.label}</span>
            <span className="text-xs text-gray-500 text-center leading-tight">{option.description}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onRetouch}
        disabled={disabled}
        className={`
          w-full py-3.5 rounded-xl font-semibold text-white transition-all
          ${disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] shadow-md hover:shadow-lg'}
        `}
      >
        ✨ AI로 음식 사진 보정하기
      </button>
    </div>
  );
}
