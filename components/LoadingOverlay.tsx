'use client';

const MESSAGES = [
  'Gemini가 사진을 분석하는 중...',
  '조명과 색감을 보정하는 중...',
  '맛있어 보이게 마무리하는 중...',
];

export default function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🍽️</div>
      </div>
      <div className="text-center space-y-1">
        <p className="font-medium text-gray-700">AI가 음식 사진을 보정하고 있어요</p>
        <p className="text-sm text-gray-400">{MESSAGES[Math.floor(Date.now() / 3000) % MESSAGES.length]}</p>
      </div>
      <p className="text-xs text-gray-400">약 15~30초 소요됩니다</p>
    </div>
  );
}
