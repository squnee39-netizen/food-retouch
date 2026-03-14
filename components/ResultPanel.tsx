'use client';

interface ResultPanelProps {
  enhancedBase64: string;
  mimeType: string;
  description?: string;
  onRetry: () => void;
}

export default function ResultPanel({ enhancedBase64, mimeType, description, onRetry }: ResultPanelProps) {
  function handleDownload() {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${enhancedBase64}`;
    link.download = `food-retouch-${Date.now()}.png`;
    link.click();
  }

  return (
    <div className="space-y-3">
      {description && (
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#FDE047]/70 font-semibold mb-2">
            AI 보정 내역
          </p>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-4 rounded-full bg-[#FDE047] text-black font-bold text-sm tracking-wide
            hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(253,224,71,0.3)]
            active:scale-95 transition-all duration-200"
        >
          보정된 사진 다운로드
        </button>
        <button
          onClick={onRetry}
          className="px-5 py-4 rounded-full border border-white/15 text-white/50
            hover:bg-white/10 hover:text-white hover:border-white/30
            font-medium text-sm transition-all duration-200 active:scale-95"
        >
          다시 보정
        </button>
      </div>
    </div>
  );
}
