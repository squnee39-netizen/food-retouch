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

export type PlatformId = 'baemin' | 'coupang' | 'naver' | 'instagram';

export interface PlatformOption {
  id: PlatformId;
  label: string;
  emoji: string;
  width: number;
  height: number;
  description: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    id: 'baemin',
    label: '배달의민족',
    emoji: '🛵',
    width: 1280,
    height: 960,
    description: '4:3 가로형 · 1280×960px',
  },
  {
    id: 'coupang',
    label: '쿠팡이츠',
    emoji: '🟡',
    width: 1280,
    height: 960,
    description: '4:3 가로형 · 1280×960px',
  },
  {
    id: 'instagram',
    label: '인스타그램',
    emoji: '📸',
    width: 1080,
    height: 1080,
    description: '1:1 정사각형 · 1080×1080px',
  },
  {
    id: 'naver',
    label: '네이버플레이스',
    emoji: '🟢',
    width: 1200,
    height: 750,
    description: '16:10 가로형 · 1200×750px',
  },
];

export interface StyleOption {
  id: RetouchStyle;
  label: string;
  description: string;
  emoji: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'appetizing',
    label: '카페 & 디저트',
    description: '마블 테이블, 라떼아트, 케이크 단면, 카페 감성',
    emoji: '☕',
  },
  {
    id: 'rustic',
    label: '양식',
    description: '유럽풍 플레이팅, 와인잔, 허브 가니쉬, 레스토랑 스타일',
    emoji: '🍝',
  },
  {
    id: 'fineDining',
    label: '한식',
    description: '청화백자, 소반, 한상차림, 전통 한식당 스타일',
    emoji: '🍚',
  },
  {
    id: 'fresh',
    label: '일식',
    description: '슬레이트 배경, 미니멀 플레이팅, 오마카세 스타일',
    emoji: '🍣',
  },
  {
    id: 'vibrant',
    label: '고기집',
    description: '참숯 화로, 석쇠 위 고기, 연기와 불빛, BBQ 스타일',
    emoji: '🔥',
  },
];
