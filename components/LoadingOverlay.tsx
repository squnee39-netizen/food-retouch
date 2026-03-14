'use client';

export default function LoadingOverlay() {
  return (
    <div
      className="rounded-[32px] p-8 flex flex-col items-center gap-5 backdrop-blur-xl shadow-clay-card"
      style={{ background: 'rgba(255,255,255,0.7)' }}
    >
      {/* Clay spinner orb */}
      <div className="relative w-20 h-20">
        {/* Outer clay ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(244,241,250,0.8)',
            boxShadow: 'inset 8px 8px 16px rgba(180,170,200,0.25), inset -8px -8px 16px rgba(255,255,255,0.9)',
          }}
        />
        {/* Spinning arc */}
        <div
          className="absolute inset-1 rounded-full border-[3px] border-transparent animate-spin"
          style={{ borderTopColor: '#7C3AED', borderRightColor: 'rgba(124,58,237,0.3)' }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-clay-breathe">
          🍽️
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5">
        <p className="font-black text-base" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
          AI가 사진을 보정하고 있어요
        </p>
        <p className="text-sm" style={{ color: '#635F69', fontFamily: 'DM Sans, sans-serif' }}>
          약 15~30초 소요됩니다
        </p>
      </div>

      {/* Clay dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-clay-pulse"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              boxShadow: '4px 4px 8px rgba(139,92,246,0.3), -2px -2px 4px rgba(255,255,255,0.8)',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
