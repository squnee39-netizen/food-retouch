'use client';

export default function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-[#FDE047] border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xl">🍽️</div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="font-semibold text-white text-sm">AI가 사진을 보정하고 있어요</p>
        <p className="text-xs text-white/30">약 15~30초 소요됩니다</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#FDE047]/40 animate-pulse-yellow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
