import { Hono } from "hono";
import { validator } from "hono/validator";
import { sql, eq, inArray, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { wordsTable, synsetsTable, pointersTable, uniqueLemmasTable } from "../db/schema";
import {
  wordsGetWordsQueryParams,
  wordsGetWordsResponse,
} from "@lingo-legends/shared/generated/zod";
import { z } from "zod";
import { translateGloss } from "../services/translation";

type Bindings = {
  DB: D1Database;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

type WordsResponse = z.infer<typeof wordsGetWordsResponse>;

app.get(
  "/",
  validator("query", (value, c) => {
    // クエリパラメータを手動で変換
    const transformed = {
      ...value,
      random: value.random === "true",
      count: value.count ? Number(value.count) : undefined,
      lexFileNum: value.lexFileNum ? Number(value.lexFileNum) : undefined,
      exact: value.exact === "true",
    };

    const result = wordsGetWordsQueryParams.safeParse(transformed);
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }

    // パラメータの変換
    const ids = result.data.ids
      ? result.data.ids.split(",").map(Number)
      : undefined;
    const random = result.data.random === true;
    const count = result.data.count;
    const lang = result.data.lang || "en";
    const lemma = result.data.lemma;
    const exact = result.data.exact === true;

    return { ids, random, count, lang, lemma, exact };
  }),
  async (c) => {
    const { ids, random, count, lang, lemma, exact } = c.req.valid("query");

    const db = drizzle(c.env.DB);

    // Step 1: 対象となる lemma のリストを取得
    let targetLemmas: string[] = [];

    if (random) {
      // ランダムに lemma を選択（unique_lemmas テーブルから高速取得）
      const randomCount = count ?? 10;
      const randomLemmas = await db
        .select({ lemma: uniqueLemmasTable.lemma })
        .from(uniqueLemmasTable)
        .orderBy(sql`RANDOM()`)
        .limit(randomCount)
        .all();
      targetLemmas = randomLemmas.map((row) => row.lemma);
    } else if (ids) {
      // 指定された ID から lemma を取得
      const lemmasFromIds = await db
        .selectDistinct({ lemma: wordsTable.lemma })
        .from(wordsTable)
        .where(inArray(wordsTable.id, ids))
        .all();
      targetLemmas = lemmasFromIds.map((row) => row.lemma);
    } else if (lemma) {
      // lemma 検索
      const lemmaCount = count ?? 100;
      const lemmaCondition = exact
        ? eq(wordsTable.lemma, lemma)
        : sql`${wordsTable.lemma} LIKE ${'%' + lemma + '%'}`;

      const lemmasFromSearch = await db
        .selectDistinct({ lemma: wordsTable.lemma })
        .from(wordsTable)
        .where(lemmaCondition)
        .limit(lemmaCount)
        .all();
      targetLemmas = lemmasFromSearch.map((row) => row.lemma);
    } else {
      return c.json({ words: [], count: 0 });
    }

    if (targetLemmas.length === 0) {
      return c.json({ words: [], count: 0 });
    }

    // Step 2: 選択された lemma の全ての意味を取得
    const words = await db
      .select({
        id: wordsTable.id,
        lemma: wordsTable.lemma,
        synsetOffset: wordsTable.synsetOffset,
        posCode: wordsTable.posCode,
        gloss: synsetsTable.gloss,
        lexFileNum: synsetsTable.lexFileNum,
      })
      .from(wordsTable)
      .innerJoin(
        synsetsTable,
        eq(wordsTable.synsetOffset, synsetsTable.synsetOffset),
      )
      .where(inArray(wordsTable.lemma, targetLemmas))
      .all();

    if (words.length === 0) {
      return c.json({ words: [], count: 0 });
    }

    // Step 3: 全ての関連語を一度に取得
    const synsetOffsets = words.map((w) => w.synsetOffset);
    const allRelations = await db
      .select({
        sourceSynsetOffset: pointersTable.sourceSynsetOffset,
        targetId: wordsTable.id,
        targetLemma: wordsTable.lemma,
        pointerSymbol: pointersTable.pointerSymbol,
        sourceTarget: pointersTable.sourceTarget,
      })
      .from(pointersTable)
      .innerJoin(
        wordsTable,
        eq(pointersTable.targetSynsetOffset, wordsTable.synsetOffset),
      )
      .where(
        sql`${pointersTable.sourceSynsetOffset} IN (${sql.join(
          synsetOffsets.map((offset) => sql`${offset}`),
          sql`, `,
        )})`,
      )
      .all();

    // メモリ上でグループ化
    const relationsByOffset = new Map<string, typeof allRelations>();
    for (const rel of allRelations) {
      if (!relationsByOffset.has(rel.sourceSynsetOffset)) {
        relationsByOffset.set(rel.sourceSynsetOffset, []);
      }
      relationsByOffset.get(rel.sourceSynsetOffset)!.push(rel);
    }

    // Step 4: lemma でグルーピング
    const groupedByLemma = new Map<string, typeof words>();
    for (const word of words) {
      if (!groupedByLemma.has(word.lemma)) {
        groupedByLemma.set(word.lemma, []);
      }
      groupedByLemma.get(word.lemma)!.push(word);
    }

    // Step 5: レスポンス構築（翻訳を適用）
    const wordResponses = await Promise.all(
      Array.from(groupedByLemma.entries()).map(async ([lemma, meanings]) => {
        // 各意味を処理
        const meaningResponses = await Promise.all(
          meanings.map(async (meaning) => {
            const translatedGloss = await translateGloss(
              meaning.synsetOffset,
              meaning.gloss || "",
              lang,
              c.env,
            );

            return {
              id: meaning.id,
              gloss: translatedGloss,
              posCode: meaning.posCode as any,
              lexFileNum: meaning.lexFileNum as any,
              relations: (
                relationsByOffset.get(meaning.synsetOffset) || []
              ).map((rel) => ({
                id: rel.targetId,
                lemma: rel.targetLemma,
                pointerSymbol: rel.pointerSymbol as any,
                sourceTarget: rel.sourceTarget || "",
              })),
            };
          }),
        );

        return {
          lemma,
          meanings: meaningResponses,
        };
      }),
    );

    const response: WordsResponse = {
      words: wordResponses,
      count: wordResponses.length,
    };

    return c.json(response);
  },
);

export default app;
