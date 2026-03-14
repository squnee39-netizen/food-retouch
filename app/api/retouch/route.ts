import { NextRequest, NextResponse } from 'next/server';
import { retouchFoodPhoto } from '@/lib/gemini';
import { RetouchRequest } from '@/types';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const FREE_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    // ── 1. 인증 확인 ──────────────────────────────────────────
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // ── 2. 사용량 확인 ─────────────────────────────────────────
    const { data: usage, error: usageError } = await supabase
      .from('usage_counts')
      .select('count')
      .eq('user_id', user.id)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    const currentCount = usage?.count ?? 0;

    if (currentCount >= FREE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `무료 보정 횟수(${FREE_LIMIT}회)를 모두 사용했습니다.`,
          code: 'LIMIT_EXCEEDED',
          used: currentCount,
          limit: FREE_LIMIT,
        },
        { status: 403 }
      );
    }

    // ── 3. 요청 유효성 검사 ────────────────────────────────────
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

    // ── 4. AI 보정 실행 ────────────────────────────────────────
    const response = await retouchFoodPhoto(body);

    if (!response.success) {
      return NextResponse.json(response);
    }

    // ── 5. 사용량 증가 (upsert) ────────────────────────────────
    await supabase
      .from('usage_counts')
      .upsert(
        {
          user_id: user.id,
          count: currentCount + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    return NextResponse.json({
      ...response,
      usageInfo: {
        used: currentCount + 1,
        limit: FREE_LIMIT,
        remaining: FREE_LIMIT - (currentCount + 1),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
