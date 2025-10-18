import { Hono } from "hono";
import { validator } from "hono/validator";
import { sql, eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { wordsTable, synsetsTable, pointersTable } from "../db/schema";
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
    const count = result.data.count ?? 10;
    const lang = result.data.lang || "en";
    const lemma = result.data.lemma;
    const exact = result.data.exact === true;

    return { ids, random, count, lang, lemma, exact };
  }),
  async (c) => {
    const { ids, random, count, lang, lemma, exact } = c.req.valid("query");

    const db = drizzle(c.env.DB);

    // lemma フィルタ条件を作成
    const getLemmaCondition = (lemmaValue: string) => {
      return exact
        ? eq(wordsTable.lemma, lemmaValue)
        : like(wordsTable.lemma, `%${lemmaValue}%`);
    };

    let words;

    if (random) {
      // ランダム取得
      let query = db
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
        );

      if (lemma) {
        query = query.where(getLemmaCondition(lemma)) as any;
      }

      words = await query
        .orderBy(sql`RANDOM()`)
        .limit(count)
        .all();
    } else if (ids) {
      // ID指定取得
      words = await db
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
        .where(inArray(wordsTable.id, ids))
        .all();
    } else if (lemma) {
      // lemma検索
      words = await db
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
        .where(getLemmaCondition(lemma))
        .limit(count)
        .all();
    } else {
      return c.json({ words: [], count: 0 });
    }

    if (words.length === 0) {
      return c.json({ words: [], count: 0 });
    }

    // 2. 全ての関連語を一度に取得
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

    // 3. メモリ上でグループ化
    const relationsByOffset = new Map<string, typeof allRelations>();
    for (const rel of allRelations) {
      if (!relationsByOffset.has(rel.sourceSynsetOffset)) {
        relationsByOffset.set(rel.sourceSynsetOffset, []);
      }
      relationsByOffset.get(rel.sourceSynsetOffset)!.push(rel);
    }

    // 4. レスポンス構築（翻訳を適用）
    const wordResponses = await Promise.all(
      words.map(async (word) => {
        const translatedGloss = await translateGloss(
          word.synsetOffset,
          word.gloss || "",
          lang,
          c.env,
        );

        return {
          id: word.id,
          lemma: word.lemma,
          gloss: translatedGloss,
          posCode: word.posCode as any,
          lexFileNum: word.lexFileNum as any,
          relations: (relationsByOffset.get(word.synsetOffset) || []).map(
            (rel) => ({
              id: rel.targetId,
              lemma: rel.targetLemma,
              pointerSymbol: rel.pointerSymbol as any,
              sourceTarget: rel.sourceTarget || "",
            }),
          ),
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
