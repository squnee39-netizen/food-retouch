'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-client';
import UploadZone from '@/components/UploadZone';
import RetouchControls from '@/components/RetouchControls';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import ResultPanel from '@/components/ResultPanel';
import LoadingOverlay from '@/components/LoadingOverlay';
import AuthModal from '@/components/AuthModal';
import { AppState, RetouchStyle, RetouchResponse } from '@/types';

const ANON_LIMIT = 3;
const AUTH_LIMIT = 10;

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [originalBase64, setOriginalBase64] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/jpeg');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RetouchStyle>('appetizing');
  const [result, setResult] = useState<RetouchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorIsAnon, setErrorIsAnon] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 사용량 상태
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(ANON_LIMIT);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchAuthUsage(user.id);
      } else {
        // 비로그인: 쿠키에서 읽기
        const anonCount = parseInt(getCookieValue('anon_count') ?? '0', 10);
        setUsageCount(anonCount);
        setUsageLimit(ANON_LIMIT);
      }
      setAuthLoading(false);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await fetchAuthUsage(u.id);
      } else {
        const anonCount = parseInt(getCookieValue('anon_count') ?? '0', 10);
        setUsageCount(anonCount);
        setUsageLimit(ANON_LIMIT);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAuthUsage(userId: string) {
    const { data } = await supabase
      .from('usage_counts')
      .select('count')
      .eq('user_id', userId)
      .single();
    setUsageCount(data?.count ?? 0);
    setUsageLimit(AUTH_LIMIT);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function handleFileReady(base64: string, mimeType: string, previewUrl: string) {
    setOriginalBase64(base64);
    setOriginalMimeType(mimeType);
    setOriginalPreviewUrl(previewUrl);
    setResult(null);
    setAppState('idle');
    setErrorMessage(null);
    setErrorCode(null);
    setErrorIsAnon(false);
  }

  async function handleRetouch() {
    if (!originalBase64) return;
    setAppState('processing');
    setErrorMessage(null);
    setErrorCode(null);
    setErrorIsAnon(false);

    try {
      const res = await fetch('/api/retouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: originalBase64, mimeType: originalMimeType, style: selectedStyle }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data);
        setAppState('done');
        if (data.usageInfo) {
          setUsageCount(data.usageInfo.used);
          setUsageLimit(data.usageInfo.limit);
        }
      } else {
        setErrorMessage(data.error ?? '보정에 실패했습니다.');
        setErrorCode(data.code ?? null);
        setErrorIsAnon(data.isAnon ?? false);
        setAppState('error');
        if (data.usageInfo) {
          setUsageCount(data.usageInfo.used ?? data.used);
          setUsageLimit(data.limit ?? usageLimit);
        }
      }
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setAppState('error');
    }
  }

  function handleRetry() {
    setResult(null);
    setAppState('idle');
    setErrorMessage(null);
    setErrorCode(null);
    setErrorIsAnon(false);
  }

  const isProcessing = appState === 'processing';
  const hasFile = !!originalBase64;
  const remaining = Math.max(0, usageLimit - usageCount);
  const isLimitExceeded = usageCount >= usageLimit;

  return (
    <main className="min-h-screen" style={{ background: '#F4F1FA' }}>
      {/* ── Blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl animate-clay-float"
          style={{ background: 'rgba(139,92,246,0.1)', top: '-10%', left: '-10%' }} />
        <div className="absolute h-[50vh] w-[50vh] rounded-full blur-3xl animate-clay-float-delayed"
          style={{ background: 'rgba(219,39,119,0.08)', top: '20%', right: '-10%' }} />
        <div className="absolute h-[45vh] w-[45vh] rounded-full blur-3xl animate-clay-float-slow"
          style={{ background: 'rgba(14,165,233,0.08)', bottom: '5%', left: '20%' }} />
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-5">

        {/* ── Hero ── */}
        <div className="text-center space-y-3 pb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-clay-button"
            style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
            <span className="text-sm">✨</span>
            <span className="text-white text-xs font-bold tracking-wide uppercase">Gemini AI</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1]"
            style={{ fontFamily: 'Nunito, sans-serif', color: '#332F3A' }}>
            음식 사진<br />
            <span style={{ background: 'linear-gradient(135deg, #7C3AED 20%, #DB2777 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI 보정
            </span>
          </h1>
          <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: '#635F69' }}>
            메뉴판용 음식 사진을 전문 푸드포토그래퍼 수준으로 보정해드립니다
          </p>
        </div>

        {/* ── 사용량 / 인증 바 ── */}
        {!authLoading && (
          <div
            className="rounded-[24px] p-4"
            style={{
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '16px 16px 32px rgba(160,150,180,0.2), -10px -10px 24px rgba(255,255,255,0.9), inset 6px 6px 12px rgba(139,92,246,0.03), inset -6px -6px 12px rgba(255,255,255,1)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {user ? (
              /* ── 로그인 상태 ── */
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}
                  >
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[160px]" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                      {user.email}
                    </p>
                    <p className="text-[10px]" style={{ color: isLimitExceeded ? '#ef4444' : '#10b981' }}>
                      {isLimitExceeded ? '무료 횟수 소진' : `${remaining}회 남음 (최대 ${AUTH_LIMIT}회)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 사용량 점 */}
                  <div className="flex gap-1">
                    {Array.from({ length: AUTH_LIMIT }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{
                          background: i < usageCount
                            ? 'linear-gradient(135deg, #A78BFA, #7C3AED)'
                            : 'rgba(200,190,220,0.35)',
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={handleSignOut}
                    className="text-[10px] px-2.5 py-1.5 rounded-full transition-all active:scale-95"
                    style={{ color: '#635F69', background: 'rgba(244,241,250,0.8)', boxShadow: 'inset 3px 3px 6px rgba(180,170,200,0.15), inset -3px -3px 6px rgba(255,255,255,0.8)' }}>
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              /* ── 비로그인 상태 ── */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                      무료 보정 {remaining}회 남음
                    </p>
                    <p className="text-[10px]" style={{ color: '#635F69' }}>
                      비로그인 {ANON_LIMIT}회 무료
                    </p>
                  </div>
                  {/* 사용량 점 */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: ANON_LIMIT }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full"
                        style={{
                          background: i < usageCount
                            ? 'linear-gradient(135deg, #A78BFA, #7C3AED)'
                            : 'rgba(200,190,220,0.35)',
                          boxShadow: i < usageCount ? '2px 2px 4px rgba(139,92,246,0.3)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 이메일 로그인 유도 배너 */}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 rounded-[16px] flex items-center justify-between px-4 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.1))',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎁</span>
                    <span className="text-xs font-bold" style={{ color: '#7C3AED', fontFamily: 'Nunito, sans-serif' }}>
                      이메일 로그인 시 <span className="text-sm">10회</span> 무료!
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
                    로그인 →
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Upload ── */}
        <UploadZone onFileReady={handleFileReady} disabled={isProcessing} />

        {/* ── Controls ── */}
        {hasFile && !isProcessing && appState !== 'done' && !isLimitExceeded && (
          <RetouchControls
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            onRetouch={handleRetouch}
            disabled={isProcessing}
          />
        )}

        {/* ── 한도 초과 배너 ── */}
        {isLimitExceeded && hasFile && appState !== 'done' && (
          <div
            className="rounded-[28px] p-6 text-center space-y-4"
            style={{
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '16px 16px 32px rgba(160,150,180,0.2), -10px -10px 24px rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="text-4xl">😢</div>
            <div>
              <p className="font-black text-base" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                {user ? `무료 ${AUTH_LIMIT}회를 모두 사용했어요!` : `비로그인 ${ANON_LIMIT}회를 모두 사용했어요!`}
              </p>
              {!user && (
                <p className="text-sm mt-1" style={{ color: '#635F69' }}>
                  이메일 로그인하면 <strong style={{ color: '#7C3AED' }}>10회</strong> 무료로 더 사용할 수 있어요!
                </p>
              )}
            </div>
            {!user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 rounded-full text-sm font-black text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                  boxShadow: '8px 8px 16px rgba(139,92,246,0.3)',
                  fontFamily: 'Nunito, sans-serif',
                }}
              >
                🎁 이메일로 10회 무료 받기
              </button>
            )}
            {user && (
              <div className="text-sm px-4 py-2 rounded-full inline-block"
                style={{ background: 'rgba(244,241,250,0.8)', color: '#635F69' }}>
                🚀 더 많은 횟수 — 업그레이드 준비 중
              </div>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {isProcessing && <LoadingOverlay />}

        {/* ── Error ── */}
        {appState === 'error' && errorMessage && errorCode !== 'LIMIT_EXCEEDED' && (
          <div
            className="rounded-[28px] p-5 flex items-start gap-4 backdrop-blur-xl"
            style={{ background: 'rgba(255,255,255,0.7)', boxShadow: '16px 16px 32px rgba(160,150,180,0.2), -10px -10px 24px rgba(255,255,255,0.9)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #fca5a5, #ef4444)', boxShadow: '4px 4px 8px rgba(239,68,68,0.3)' }}>
              <span className="text-white text-sm">⚠</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#ef4444', fontFamily: 'Nunito, sans-serif' }}>
                {errorMessage}
              </p>
              {errorIsAnon && (
                <button onClick={() => { setShowAuthModal(true); setAppState('idle'); }}
                  className="mt-2 text-xs font-bold underline underline-offset-2" style={{ color: '#7C3AED' }}>
                  이메일로 10회 무료 받기 →
                </button>
              )}
              {!errorIsAnon && (
                <button onClick={handleRetry} className="mt-2 text-xs font-medium underline underline-offset-2" style={{ color: '#7C3AED' }}>
                  다시 시도
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {appState === 'done' && result?.enhancedImageBase64 && originalPreviewUrl && (
          <div className="space-y-4">
            <BeforeAfterSlider
              beforeUrl={originalPreviewUrl}
              afterBase64={result.enhancedImageBase64}
              afterMimeType={result.mimeType ?? 'image/png'}
            />
            <ResultPanel
              enhancedBase64={result.enhancedImageBase64}
              mimeType={result.mimeType ?? 'image/png'}
              description={result.description}
              onRetry={handleRetry}
            />
          </div>
        )}

        <p className="text-center text-[10px] uppercase tracking-widest pb-4" style={{ color: '#635F69', opacity: 0.4 }}>
          Powered by Google Gemini API
        </p>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  );
}
