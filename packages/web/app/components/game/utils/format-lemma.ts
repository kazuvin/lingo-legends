/**
 * アンダースコアを半角スペースに変換してlemmaをフォーマットします。
 * 複数の単語からなるlemmaを人間が読みやすい形式で表示する際に使用します。
 *
 * @param lemma - フォーマット対象のlemma文字列（例: "break_down", "give_up"）
 * @returns アンダースコアがスペースに置き換えられたlemma（例: "break down", "give up"）
 *
 * @example
 * ```ts
 * formatLemma("break_down"); // "break down" を返す
 * formatLemma("hello_world_test"); // "hello world test" を返す
 * formatLemma("simple"); // "simple" を返す
 * ```
 */
export function formatLemma(lemma: string): string {
  return lemma.replace(/_/g, ' ');
}
