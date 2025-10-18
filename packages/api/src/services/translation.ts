import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { translationsTable } from "../db/schema";

type Bindings = {
  DB: D1Database;
  AI: Ai;
};

/**
 * テキストを翻訳する（キャッシュ優先）
 * 1. キャッシュをチェック
 * 2. キャッシュミスの場合はオンデマンド翻訳
 * 3. DBに保存
 */
export async function translateGloss(
  synsetOffset: string,
  gloss: string,
  targetLang: string,
  env: Bindings,
): Promise<string> {
  // 英語の場合はそのまま返す
  if (targetLang === "en") {
    return gloss;
  }

  const db = drizzle(env.DB);

  // 1. キャッシュをチェック
  const cached = await db
    .select()
    .from(translationsTable)
    .where(
      and(
        eq(translationsTable.synsetOffset, synsetOffset),
        eq(translationsTable.languageCode, targetLang),
      ),
    )
    .get();

  if (cached) {
    return cached.translatedGloss;
  }

  // 2. キャッシュミス：オンデマンド翻訳
  const translated = await translateWithAI(gloss, targetLang, env.AI);

  // 3. DBに保存
  await db.insert(translationsTable).values({
    synsetOffset,
    languageCode: targetLang,
    translatedGloss: translated,
    createdAt: Date.now(),
  });

  return translated;
}

/**
 * Cloudflare Workers AIを使ってテキストを翻訳
 */
async function translateWithAI(
  text: string,
  targetLang: string,
  ai: Ai,
): Promise<string> {
  try {
    const response = await ai.run("@cf/meta/m2m100-1.2b", {
      text,
      source_lang: "english",
      target_lang: mapLanguageCode(targetLang),
    });

    return (response as any).translated_text || text;
  } catch (error) {
    console.error("Translation error:", error);
    // エラー時は元のテキストを返す
    return text;
  }
}

/**
 * 言語コードをWorkers AIのフォーマットに変換
 */
function mapLanguageCode(code: string): string {
  const map: Record<string, string> = {
    ja: "japanese",
    es: "spanish",
    fr: "french",
    de: "german",
    zh: "chinese",
    ko: "korean",
    it: "italian",
    pt: "portuguese",
    ru: "russian",
  };
  return map[code] || code;
}
