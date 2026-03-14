import { NextRequest, NextResponse } from 'next/server';
import { retouchFoodPhoto } from '@/lib/gemini';
import { RetouchRequest } from '@/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ANON_LIMIT = 3;   // 비로그인
const AUTH_LIMIT = 10;  // 로그인

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    let currentCount = 0;
    const limit = user ? AUTH_LIMIT : ANON_LIMIT;

    // ── 로그인 사용자: Supabase DB ────────────────────────────
    if (user) {
      const { data: usage, error: usageError } = await supabase
        .from('usage_counts')
        .select('count')
        .eq('user_id', user.id)
        .single();

      if (usageError && usageError.code !== 'PGRST116') throw usageError;
      currentCount = usage?.count ?? 0;
    } else {
      // ── 비로그인: 쿠키 카운터 ─────────────────────────────
      currentCount = parseInt(req.cookies.get('anon_count')?.value ?? '0', 10);
    }

    // ── 한도 초과 체크 ────────────────────────────────────────
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: user
            ? `무료 보정 횟수(${limit}회)를 모두 사용했습니다.`
            : `비로그인 무료 횟수(${limit}회)를 모두 사용했어요. 이메일 로그인 시 ${AUTH_LIMIT}회 제공!`,
          code: 'LIMIT_EXCEEDED',
          used: currentCount,
          limit,
          isAnon: !user,
        },
        { status: 403 }
      );
    }

    // ── 요청 유효성 검사 ──────────────────────────────────────
    const body: RetouchRequest = await req.json();

    if (!body.imageBase64 || !body.mimeType || !body.style) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const estimatedBytes = (body.imageBase64.length * 3) / 4;
    if (estimatedBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '이미지 크기가 10MB를 초과합니다.' },
        { status: 413 }
      );
    }

    // ── AI 보정 실행 ──────────────────────────────────────────
    const aiResponse = await retouchFoodPhoto(body);
    if (!aiResponse.success) {
      return NextResponse.json(aiResponse);
    }

    // ── 사용량 증가 ───────────────────────────────────────────
    const newCount = currentCount + 1;

    if (user) {
      await supabase
        .from('usage_counts')
        .upsert(
          { user_id: user.id, count: newCount, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
    }

    const payload = {
      ...aiResponse,
      usageInfo: {
        used: newCount,
        limit,
        remaining: limit - newCount,
        isAnon: !user,
      },
    };

    // 비로그인: 쿠키 카운터 업데이트
    if (!user) {
      const res = NextResponse.json(payload);
      res.cookies.set('anon_count', String(newCount), {
        maxAge: 60 * 60 * 24 * 30, // 30일
        path: '/',
        sameSite: 'lax',
      });
      return res;
    }

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
