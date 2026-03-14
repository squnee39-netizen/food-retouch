import { GoogleGenerativeAI } from '@google/generative-ai';
import { RetouchRequest, RetouchResponse } from '@/types';
import { RETOUCH_PROMPTS } from './prompts';

const MODEL_ID = 'gemini-2.5-flash-image';

export async function retouchFoodPhoto(req: RetouchRequest): Promise<RetouchResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: RETOUCH_PROMPTS[req.style] },
          {
            inlineData: {
              data: req.imageBase64,
              mimeType: req.mimeType,
            },
          },
        ],
      },
    ],
    generationConfig: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseModalities: ['TEXT', 'IMAGE'],
    } as any,
  });

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  let enhancedImageBase64: string | undefined;
  let description: string | undefined;

  for (const part of parts) {
    if ('inlineData' in part && part.inlineData?.data) {
      enhancedImageBase64 = part.inlineData.data;
    }
    if ('text' in part && part.text) {
      description = part.text;
    }
  }

  if (!enhancedImageBase64) {
    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      return { success: false, error: '안전 정책으로 인해 이미지를 처리할 수 없습니다. 다른 사진을 시도해주세요.' };
    }
    return { success: false, error: 'Gemini가 이미지를 반환하지 않았습니다. 다시 시도해주세요.' };
  }

  return {
    success: true,
    enhancedImageBase64,
    mimeType: 'image/png',
    description,
  };
}
