'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSendLink() {
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      setError('로그인 링크 전송에 실패했습니다. 다시 시도해주세요.');
    } else {
      setStep('sent');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(50,47,58,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-[40px] p-8 space-y-6"
        style={{
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '20px 20px 60px rgba(139,92,246,0.2), -15px -15px 40px rgba(255,255,255,1), inset 6px 6px 12px rgba(139,92,246,0.04), inset -6px -6px 12px rgba(255,255,255,1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* 닫기 버튼 */}
        <div className="flex justify-between items-start">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              boxShadow: '8px 8px 16px rgba(139,92,246,0.3), -4px -4px 8px rgba(255,255,255,0.6)',
            }}
          >
            ✨
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
            style={{
              background: 'rgba(244,241,250,0.8)',
              color: '#635F69',
              boxShadow: 'inset 4px 4px 8px rgba(180,170,200,0.2), inset -4px -4px 8px rgba(255,255,255,0.8)',
            }}
          >
            ✕
          </button>
        </div>

        {step === 'email' ? (
          <>
            <div>
              <h2 className="text-2xl font-black" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                무료로 시작하기
              </h2>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#635F69' }}>
                이메일로 로그인 링크를 보내드려요.<br />비밀번호가 필요 없어요!
              </p>
            </div>

            {/* 무료 혜택 */}
            <div
              className="rounded-[24px] p-4 space-y-2"
              style={{
                background: 'rgba(244,241,250,0.7)',
                boxShadow: 'inset 6px 6px 12px rgba(180,170,200,0.15), inset -6px -6px 12px rgba(255,255,255,0.8)',
              }}
            >
              {[
                { emoji: '🎁', text: '무료 보정 3회 제공' },
                { emoji: '📥', text: '플랫폼별 사이즈 다운로드' },
                { emoji: '⚡', text: '15초만에 AI 보정 완료' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5">
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: '#332F3A' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* 이메일 입력 */}
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                placeholder="이메일 주소 입력"
                className="w-full px-5 py-4 rounded-[20px] text-sm outline-none transition-all"
                style={{
                  background: 'rgba(244,241,250,0.8)',
                  color: '#332F3A',
                  boxShadow: 'inset 8px 8px 16px rgba(180,170,200,0.2), inset -8px -8px 16px rgba(255,255,255,0.9)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              {error && (
                <p className="text-xs text-red-500 px-1">{error}</p>
              )}
              <button
                onClick={handleSendLink}
                disabled={loading}
                className="w-full py-4 rounded-[20px] font-black text-sm text-white transition-all active:scale-[0.96]"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: loading ? 'rgba(200,190,220,0.5)' : 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                  boxShadow: loading
                    ? 'inset 6px 6px 12px rgba(180,170,200,0.2)'
                    : '12px 12px 24px rgba(139,92,246,0.3), -8px -8px 16px rgba(255,255,255,0.4)',
                  color: loading ? '#635F69' : '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '전송 중...' : '로그인 링크 받기 →'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, #6ee7b7, #10b981)',
                boxShadow: '12px 12px 24px rgba(16,185,129,0.25), -8px -8px 16px rgba(255,255,255,0.8)',
              }}
            >
              📧
            </div>
            <div>
              <h2 className="text-2xl font-black" style={{ color: '#332F3A', fontFamily: 'Nunito, sans-serif' }}>
                이메일을 확인하세요!
              </h2>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#635F69' }}>
                <strong>{email}</strong>으로<br />
                로그인 링크를 보냈어요.<br />
                링크를 클릭하면 자동으로 로그인됩니다.
              </p>
            </div>
            <button
              onClick={() => setStep('email')}
              className="text-xs underline underline-offset-2"
              style={{ color: '#7C3AED' }}
            >
              다른 이메일로 다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
