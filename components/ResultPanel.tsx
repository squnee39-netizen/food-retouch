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
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-600 mb-1">AI 보정 내역</p>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all active:scale-[0.98] shadow-md"
        >
          ⬇ 보정된 사진 다운로드
        </button>
        <button
          onClick={onRetry}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all"
        >
          다시 보정
        </button>
      </div>
    </div>
  );
}
