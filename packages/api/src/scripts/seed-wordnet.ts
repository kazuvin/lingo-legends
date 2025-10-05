import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  posTypesTable,
  lexFileTypesTable,
  pointerTypesTable,
  synsetsTable,
  wordsTable,
  pointersTable,
} from "../db/schema";

const WORDNET_DB_PATH =
  process.argv[2] || "../../playground/wordnet/wordnet.db";
const LOCAL_DB_PATH =
  process.argv[3] ||
  "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/07dc5a213f927194558d59e31a6a40205e57d865389e73d643f1085481d52aca.sqlite";

async function seedWordNet() {
  console.log("WordNet Seed Script");
  console.log("=".repeat(40));
  console.log(`Source: ${WORDNET_DB_PATH}`);
  console.log(`Target: ${LOCAL_DB_PATH}`);
  console.log();

  // WordNet データベースから読み込み
  const wordnetDb = new Database(WORDNET_DB_PATH, { readonly: true });

  // ローカル D1 データベースに接続
  const localDb = new Database(LOCAL_DB_PATH);
  const db = drizzle(localDb);

  try {
    // 1. POS Types
    console.log("Importing POS types...");
    const posTypes = wordnetDb
      .prepare("SELECT * FROM pos_types")
      .all() as Array<{
      pos_code: string;
      name: string;
      description: string | null;
    }>;

    for (const pos of posTypes) {
      await db
        .insert(posTypesTable)
        .values({
          posCode: pos.pos_code,
          name: pos.name,
          description: pos.description,
        })
        .onConflictDoNothing();
    }
    console.log(`  ✓ ${posTypes.length} POS types`);

    // 2. Lexical File Types
    console.log("Importing lexical file types...");
    const lexFileTypes = wordnetDb
      .prepare("SELECT * FROM lex_file_types")
      .all() as Array<{
      file_num: number;
      name: string;
      description: string | null;
    }>;

    for (const lex of lexFileTypes) {
      await db
        .insert(lexFileTypesTable)
        .values({
          fileNum: lex.file_num,
          name: lex.name,
          description: lex.description,
        })
        .onConflictDoNothing();
    }
    console.log(`  ✓ ${lexFileTypes.length} lexical file types`);

    // 3. Pointer Types
    console.log("Importing pointer types...");
    const pointerTypes = wordnetDb
      .prepare("SELECT * FROM pointer_types")
      .all() as Array<{
      symbol: string;
      name: string;
      description: string | null;
    }>;

    for (const ptr of pointerTypes) {
      await db
        .insert(pointerTypesTable)
        .values({
          symbol: ptr.symbol,
          name: ptr.name,
          description: ptr.description,
        })
        .onConflictDoNothing();
    }
    console.log(`  ✓ ${pointerTypes.length} pointer types`);

    // 4. Synsets (バッチ処理)
    console.log("Importing synsets...");
    const synsets = wordnetDb.prepare("SELECT * FROM synsets").all() as Array<{
      synset_offset: string;
      lex_file_num: number;
      pos_code: string;
      gloss: string | null;
    }>;

    const BATCH_SIZE = 1000;
    for (let i = 0; i < synsets.length; i += BATCH_SIZE) {
      const batch = synsets.slice(i, i + BATCH_SIZE);
      await db
        .insert(synsetsTable)
        .values(
          batch.map((s) => ({
            synsetOffset: s.synset_offset,
            lexFileNum: s.lex_file_num,
            posCode: s.pos_code,
            gloss: s.gloss,
          })),
        )
        .onConflictDoNothing();
      process.stdout.write(
        `\r  Progress: ${Math.min(i + BATCH_SIZE, synsets.length)}/${synsets.length}`,
      );
    }
    console.log(`\n  ✓ ${synsets.length} synsets`);

    // 5. Words (バッチ処理)
    console.log("Importing words...");
    const words = wordnetDb.prepare("SELECT * FROM words").all() as Array<{
      lemma: string;
      pos_code: string;
      synset_offset: string;
      lex_id: number;
    }>;

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);
      await db.insert(wordsTable).values(
        batch.map((w) => ({
          lemma: w.lemma,
          posCode: w.pos_code,
          synsetOffset: w.synset_offset,
          lexId: w.lex_id,
        })),
      );
      process.stdout.write(
        `\r  Progress: ${Math.min(i + BATCH_SIZE, words.length)}/${words.length}`,
      );
    }
    console.log(`\n  ✓ ${words.length} words`);

    // 6. Pointers (バッチ処理)
    console.log("Importing pointers...");
    const pointers = wordnetDb
      .prepare("SELECT * FROM pointers")
      .all() as Array<{
      source_synset_offset: string;
      pointer_symbol: string;
      target_synset_offset: string;
      source_target: string | null;
    }>;

    for (let i = 0; i < pointers.length; i += BATCH_SIZE) {
      const batch = pointers.slice(i, i + BATCH_SIZE);
      await db.insert(pointersTable).values(
        batch.map((p) => ({
          sourceSynsetOffset: p.source_synset_offset,
          pointerSymbol: p.pointer_symbol,
          targetSynsetOffset: p.target_synset_offset,
          sourceTarget: p.source_target,
        })),
      );
      process.stdout.write(
        `\r  Progress: ${Math.min(i + BATCH_SIZE, pointers.length)}/${pointers.length}`,
      );
    }
    console.log(`\n  ✓ ${pointers.length} pointers`);

    console.log("\n✅ WordNet data imported successfully!");
  } catch (error) {
    console.error("\n❌ Error importing WordNet data:", error);
    throw error;
  } finally {
    wordnetDb.close();
    localDb.close();
  }
}

seedWordNet();
