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
      <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
        보정 스타일 선택
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyle === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onStyleChange(option.id)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-[24px] border transition-all duration-200 text-center
                ${isSelected
                  ? 'border-[#FDE047] bg-[#FDE047]/10 shadow-[0_0_20px_rgba(253,224,71,0.15)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
              `}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#FDE047]' : 'text-white/80'}`}>
                {option.label}
              </span>
              <span className="text-[10px] text-white/30 leading-tight">{option.description}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onRetouch}
        disabled={disabled}
        className={`
          w-full py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-200
          ${disabled
            ? 'bg-white/10 text-white/20 cursor-not-allowed'
            : 'bg-[#FDE047] text-black hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(253,224,71,0.3)] active:scale-95'}
        `}
      >
        AI로 음식 사진 보정하기
      </button>
    </div>
  );
}
