export type RetouchStyle =
  | 'appetizing'
  | 'rustic'
  | 'fineDining'
  | 'fresh'
  | 'vibrant';

export interface RetouchRequest {
  imageBase64: string;
  mimeType: string;
  style: RetouchStyle;
}

export interface RetouchResponse {
  success: boolean;
  enhancedImageBase64?: string;
  mimeType?: string;
  description?: string;
  error?: string;
}

export type AppState = 'idle' | 'processing' | 'done' | 'error';

export interface StyleOption {
  id: RetouchStyle;
  label: string;
  description: string;
  emoji: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'appetizing',
    label: '클린 플랫레이',
    description: '밝은 배경, 탑뷰, 메뉴판 스타일',
    emoji: '🍽️',
  },
  {
    id: 'rustic',
    label: '볼드 컬러',
    description: '강렬한 단색 배경, 브랜드 광고 스타일',
    emoji: '🟡',
  },
  {
    id: 'fineDining',
    label: '프리미엄 다크',
    description: '다크 스톤, 고급 도자기, 파인다이닝',
    emoji: '✨',
  },
  {
    id: 'fresh',
    label: '모던 BBQ',
    description: '그레이 콘크리트, 블랙 식기, 고기집 스타일',
    emoji: '🥩',
  },
  {
    id: 'vibrant',
    label: '황동 포장마차',
    description: '황동 그릇, 버건디 배경, 전통 주점 스타일',
    emoji: '🏮',
  },
];
