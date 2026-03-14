import { NextRequest, NextResponse } from 'next/server';
import { retouchFoodPhoto } from '@/lib/gemini';
import { RetouchRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
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

    const response = await retouchFoodPhoto(body);
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
