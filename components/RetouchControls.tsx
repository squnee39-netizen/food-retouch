'use client';

import { RetouchStyle, STYLE_OPTIONS } from '@/types';

interface RetouchControlsProps {
  selectedStyle: RetouchStyle;
  onStyleChange: (style: RetouchStyle) => void;
  onRetouch: () => void;
  disabled?: boolean;
}

const STYLE_GRADIENTS: Record<RetouchStyle, string> = {
  appetizing: 'linear-gradient(135deg, #fde68a, #f59e0b)',
  rustic:     'linear-gradient(135deg, #86efac, #10b981)',
  fineDining: 'linear-gradient(135deg, #fca5a5, #ef4444)',
  fresh:      'linear-gradient(135deg, #93c5fd, #3b82f6)',
  vibrant:    'linear-gradient(135deg, #f9a8d4, #db2777)',
};

export default function RetouchControls({
  selectedStyle,
  onStyleChange,
  onRetouch,
  disabled,
}: RetouchControlsProps) {
  return (
    <div
      className="rounded-[32px] p-5 space-y-4 backdrop-blur-xl shadow-clay-card"
      style={{ background: 'rgba(255,255,255,0.7)' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#635F69', fontFamily: 'DM Sans, sans-serif' }}>
        보정 스타일 선택
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyle === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onStyleChange(option.id)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-[24px] transition-all duration-200 text-center
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.92]'}
              `}
              style={{
                boxShadow: isSelected
                  ? '12px 12px 24px rgba(139,92,246,0.25), -8px -8px 16px rgba(255,255,255,0.9), inset 4px 4px 8px rgba(255,255,255,0.4), inset -4px -4px 8px rgba(0,0,0,0.06)'
                  : 'inset 8px 8px 16px rgba(180,170,200,0.15), inset -8px -8px 16px rgba(255,255,255,0.7)',
                background: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(244,241,250,0.6)',
                transform: isSelected ? 'translateY(-2px)' : undefined,
              }}
            >
              {/* Icon orb */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{
                  background: isSelected ? STYLE_GRADIENTS[option.id] : 'rgba(200,190,220,0.3)',
                  boxShadow: isSelected
                    ? '6px 6px 12px rgba(0,0,0,0.12), -4px -4px 8px rgba(255,255,255,0.8)'
                    : 'none',
                }}
              >
                {option.emoji}
              </div>
              <span
                className="text-xs font-bold leading-tight"
                style={{
                  color: isSelected ? '#332F3A' : '#635F69',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                {option.label}
              </span>
              <span className="text-[9px] leading-tight" style={{ color: '#635F69', opacity: isSelected ? 0.8 : 0.5 }}>
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onRetouch}
        disabled={disabled}
        className="w-full py-4 rounded-[20px] font-black text-sm tracking-wide transition-all duration-200 text-white"
        style={{
          fontFamily: 'Nunito, sans-serif',
          background: disabled
            ? 'rgba(200,190,220,0.4)'
            : 'linear-gradient(135deg, #A78BFA, #7C3AED)',
          boxShadow: disabled
            ? 'inset 8px 8px 16px rgba(180,170,200,0.2), inset -8px -8px 16px rgba(255,255,255,0.6)'
            : '12px 12px 24px rgba(139,92,246,0.3), -8px -8px 16px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(255,255,255,0.4), inset -4px -4px 8px rgba(0,0,0,0.1)',
          color: disabled ? '#635F69' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = '';
        }}
      >
        ✨ AI로 음식 사진 보정하기
      </button>
    </div>
  );
}
