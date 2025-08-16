import enUS from './en-US';
import jaJP from './ja-JP';

export type Language = 'en-US' | 'ja-JP';

export const resources = {
  'en-US': enUS,
  'ja-JP': jaJP,
} as const;

export type Resources = typeof resources;
export type Namespace = keyof Resources['en-US'];

export const defaultNS = 'common';
export const fallbackLng: Language = 'en-US';