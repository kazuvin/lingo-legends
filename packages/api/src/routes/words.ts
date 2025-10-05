import { Hono } from "hono";
import { sql, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { wordsTable, synsetsTable, pointersTable } from "../db/schema";
import { type wordResponse } from "../schemas";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

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

  const response: wordResponse = {
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
