import { Hono } from "hono";
import { validator } from "hono/validator";
import { sql, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { wordsTable, synsetsTable, pointersTable } from "../db/schema";
import {
  wordsGetWordsQueryParams,
  wordsGetWordsResponse,
} from "@lingo-legends/shared/generated/zod";
import type { z } from "zod";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

type WordsQuery = z.infer<typeof wordsGetWordsQueryParams>;
type WordsResponse = z.infer<typeof wordsGetWordsResponse>;

app.get(
  "/",
  validator("query", (value, c) => {
    const result = wordsGetWordsQueryParams.safeParse(value);
    if (!result.success) {
      return c.json({ error: result.error.issues }, 400);
    }
    // ids を配列に変換
    const ids = result.data.ids.split(",").map(Number);
    return { ids };
  }),
  async (c) => {
    const { ids } = c.req.valid("query");

    const db = drizzle(c.env.DB);

    // 1. 単語とsynset情報を一度に取得
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
      .where(inArray(wordsTable.id, ids))
      .all();

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

    // 4. レスポンス構築
    const wordResponses = words.map((word) => ({
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

    const response: WordsResponse = {
      words: wordResponses,
      count: wordResponses.length,
    };

    return c.json(response);
  },
);

app.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid ID" }, 400);
  }

  const db = drizzle(c.env.DB);

  // 1. 単語とsynset情報を取得
  const word = await db
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
    .where(eq(wordsTable.id, id))
    .get();

  if (!word) {
    return c.json({ error: "Word not found" }, 404);
  }

  // 2. 関連語を取得
  const relations = await db
    .select({
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
    .where(eq(pointersTable.sourceSynsetOffset, word.synsetOffset))
    .all();

  const response = {
    id: word.id,
    lemma: word.lemma,
    gloss: word.gloss || "",
    posCode: word.posCode as any,
    lexFileNum: word.lexFileNum as any,
    relations: relations.map((rel) => ({
      id: rel.targetId,
      lemma: rel.targetLemma,
      pointerSymbol: rel.pointerSymbol as any,
      sourceTarget: rel.sourceTarget || "",
    })),
  };

  return c.json(response);
});

export default app;
