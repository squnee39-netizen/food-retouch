# food-retouch — 음식 사진 AI 보정 웹사이트

## 프로젝트 개요
식당 메뉴용 음식 사진을 일반 카메라로 찍은 후, Google Gemini API로 전문 푸드포토그래퍼 수준으로 재촬영된 것처럼 보정해주는 웹사이트.

## 기술 스택
- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Google Gemini API — `gemini-2.5-flash-image`
- **Styling**: Tailwind CSS
- **의존성**: `@google/generative-ai`

## 프로젝트 구조
```
food-retouch/
├── .env.local                    # GEMINI_API_KEY (서버 사이드 전용, NEXT_PUBLIC_ 금지)
├── next.config.ts                # bodySizeLimit: "10mb"
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # 메인 상태 관리 허브 (AppState)
│   ├── globals.css
│   └── api/retouch/route.ts      # POST: Gemini 호출 API route
├── components/
│   ├── UploadZone.tsx            # 드래그&드롭, canvas 리사이즈, base64 변환
│   ├── RetouchControls.tsx       # 5개 스타일 선택 카드 + 실행 버튼
│   ├── BeforeAfterSlider.tsx     # Pointer Events 드래그 비교 슬라이더 (외부 라이브러리 없음)
│   ├── ResultPanel.tsx           # 다운로드 버튼 + Gemini 설명 텍스트
│   └── LoadingOverlay.tsx        # 처리 중 스피너 오버레이
├── lib/
│   ├── gemini.ts                 # Gemini 클라이언트, retouchFoodPhoto()
│   ├── prompts.ts                # 스타일별 상세 프롬프트 (가장 자주 수정하는 파일)
│   └── imageUtils.ts             # canvas 리사이즈 (max 2048×2048), MIME 검증
└── types/index.ts                # RetouchStyle, RetouchRequest/Response, AppState, STYLE_OPTIONS
```

## Gemini API 핵심 설정
```typescript
// lib/gemini.ts
const MODEL_ID = 'gemini-2.5-flash-image'; // 이미지 생성 가능한 모델

generationConfig: {
  responseModalities: ['TEXT', 'IMAGE'], // 반드시 둘 다 명시
} as any
```
- 입력: base64 이미지 + 텍스트 프롬프트
- 출력: 보정된 이미지 (base64, PNG) + 설명 텍스트
- API 키는 `.env.local`의 `GEMINI_API_KEY`만 사용 (서버 전용)

## 5가지 보정 스타일
스타일은 `types/index.ts`의 `STYLE_OPTIONS`에 정의, 프롬프트는 `lib/prompts.ts`에 상세 작성.
전문 한국 푸드포토그래퍼 포트폴리오를 분석하여 설계된 5가지 스타일:

| ID | 라벨 | 스타일 설명 |
|----|------|------------|
| `appetizing` | 클린 플랫레이 | 밝은 회색 배경, 90° 탑뷰, 화이트 세라믹, 미니멀 메뉴판 스타일 |
| `rustic` | 볼드 컬러 | 선명한 단색 배경(노랑/빨강), 스테인리스 식기, 브랜드 광고 스타일 |
| `fineDining` | 프리미엄 다크 | 다크 차콜 석재, 청화백자 도자기, 대나무 매트, 파인다이닝 에디토리얼 |
| `fresh` | 모던 BBQ | 라이트 그레이 콘크리트, 블랙 무광 세라믹, 원목 서빙보드, 고기집 스타일 |
| `vibrant` | 황동 포장마차 | 황동(brass) 그릇, 버건디 테이블보, 따뜻한 앰버 조명, 전통 주점 스타일 |

## 주의사항
- **프롬프트 수정 시**: `lib/prompts.ts`를 수정하기 전에 반드시 먼저 Read로 읽을 것 (린터가 파일 자동 수정하면 "File has been modified since read" 오류 발생)
- **이미지 크기**: 클라이언트에서 canvas로 max 2048×2048 리사이즈 후 전송, 서버는 10MB 초과 시 413 반환
- **BeforeAfterSlider**: 외부 라이브러리 없이 `useRef` + Pointer Events로 구현, "after" 이미지를 `width: {sliderPosition}%` 컨테이너로 클리핑

## 로컬 실행
```bash
cd /Users/jeonseunghun/Downloads/projects/food-retouch
npm run dev
# → http://localhost:3000
```
