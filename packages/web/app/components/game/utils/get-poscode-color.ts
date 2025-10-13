import { PosCode } from '@lingo-legends/shared/generated/react-query';

/**
 * PosCodeに応じたOKLCH色を返すユーティリティ関数
 *
 * @param posCode - 品詞コード（n, v, a, s, r）
 * @returns 背景色、テキスト色、バッジテキスト色を含むオブジェクト
 *
 * @example
 * ```ts
 * const colors = getPosCodeColor(PosCode.n);
 * // Returns: { bg: "oklch(0.55 0.25 280)", text: "oklch(0.95 0.05 280)", badge: "oklch(0.75 0.15 280)" }
 * ```
 */
export function getPosCodeColor(posCode: PosCode): {
  bg: string;
  text: string;
  badge: string;
} {
  switch (posCode) {
    case PosCode.n:
      // 名詞 - 青紫系
      return {
        bg: 'oklch(0.55 0.25 280)',
        text: 'oklch(0.95 0.05 280)',
        badge: 'oklch(0.75 0.15 280)',
      };
    case PosCode.v:
      // 動詞 - 赤紫系
      return {
        bg: 'oklch(0.55 0.25 340)',
        text: 'oklch(0.95 0.05 340)',
        badge: 'oklch(0.75 0.15 340)',
      };
    case PosCode.a:
      // 形容詞 - 緑系
      return {
        bg: 'oklch(0.55 0.25 160)',
        text: 'oklch(0.95 0.05 160)',
        badge: 'oklch(0.75 0.15 160)',
      };
    case PosCode.s:
      // 形容詞衛星 - 黄緑系
      return {
        bg: 'oklch(0.55 0.25 130)',
        text: 'oklch(0.95 0.05 130)',
        badge: 'oklch(0.75 0.15 130)',
      };
    case PosCode.r:
      // 副詞 - オレンジ系
      return {
        bg: 'oklch(0.55 0.25 50)',
        text: 'oklch(0.95 0.05 50)',
        badge: 'oklch(0.75 0.15 50)',
      };
    default:
      // デフォルト - 紫系（元の色）
      return {
        bg: 'oklch(0.55 0.25 290)',
        text: 'oklch(0.95 0.05 290)',
        badge: 'oklch(0.75 0.15 290)',
      };
  }
}
