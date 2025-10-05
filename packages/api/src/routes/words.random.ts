import { Hono } from "hono";
import { validator } from "hono/validator";
import { sql, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { wordsTable, synsetsTable, pointersTable } from "../db/schema";
import {
  wordsGetRandomQueryParams,
  wordsGetRandomResponse,
} from "@lingo-legends/shared/generated/zod";
import type { z } from "zod";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

type RandomQuery = z.infer<typeof wordsGetRandomQueryParams>;
type RandomResponse = z.infer<typeof wordsGetRandomResponse>;

app.get(
  "/",
  validator("query", (value, c) => {
    const result = wordsGetRandomQueryParams.safeParse(value);
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
    // count を数値に変換（デフォルト10）
    const count = result.data.count ? Number(result.data.count) : 10;
    return { count };
  }),
  async (c) => {
    const { count } = c.req.valid("query");

    const db = drizzle(c.env.DB);

    // 1. ランダムな単語とsynset情報を一度に取得
    const randomWords = await db
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
      .orderBy(sql`RANDOM()`)
      .limit(count);

    if (randomWords.length === 0) {
      return c.json({ words: [], count: 0 });
    }

    // 2. 全ての関連語を一度に取得
    const synsetOffsets = randomWords.map((w) => w.synsetOffset);
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

    // 4. レスポンス構築
    const words = randomWords.map((word) => ({
      id: word.id,
      lemma: word.lemma,
      gloss: word.gloss || "",
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
    }));

    const response: RandomResponse = {
      words,
      count: words.length,
    };

    return c.json(response);
  },
);

export default app;
