import Database from "better-sqlite3";
import { writeFileSync } from "fs";

const LOCAL_DB_PATH =
  process.argv[2] ||
  "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/07dc5a213f927194558d59e31a6a40205e57d865389e73d643f1085481d52aca.sqlite";
const OUTPUT_PATH = process.argv[3] || "./wordnet-dump.sql";

function dumpWordNetData() {
  console.log("WordNet SQL Dump Script");
  console.log("=".repeat(40));
  console.log(`Source: ${LOCAL_DB_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log();

  const db = new Database(LOCAL_DB_PATH, { readonly: true });
  const sqlStatements: string[] = [];

  // Helper function to escape SQL values
  const escape = (value: any): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "number") return value.toString();
    return `'${value.toString().replace(/'/g, "''")}'`;
  };

  try {
    // 1. POS Types
    console.log("Dumping POS types...");
    const posTypes = db.prepare("SELECT * FROM pos_types").all();
    for (const row of posTypes as any[]) {
      sqlStatements.push(
        `INSERT INTO pos_types (pos_code, name, description) VALUES (${escape(row.pos_code)}, ${escape(row.name)}, ${escape(row.description)}) ON CONFLICT DO NOTHING;`
      );
    }
    console.log(`  ✓ ${posTypes.length} rows`);

    // 2. Lexical File Types
    console.log("Dumping lexical file types...");
    const lexFileTypes = db.prepare("SELECT * FROM lex_file_types").all();
    for (const row of lexFileTypes as any[]) {
      sqlStatements.push(
        `INSERT INTO lex_file_types (file_num, name, description) VALUES (${escape(row.file_num)}, ${escape(row.name)}, ${escape(row.description)}) ON CONFLICT DO NOTHING;`
      );
    }
    console.log(`  ✓ ${lexFileTypes.length} rows`);

    // 3. Pointer Types
    console.log("Dumping pointer types...");
    const pointerTypes = db.prepare("SELECT * FROM pointer_types").all();
    for (const row of pointerTypes as any[]) {
      sqlStatements.push(
        `INSERT INTO pointer_types (symbol, name, description) VALUES (${escape(row.symbol)}, ${escape(row.name)}, ${escape(row.description)}) ON CONFLICT DO NOTHING;`
      );
    }
    console.log(`  ✓ ${pointerTypes.length} rows`);

    // 4. Synsets
    console.log("Dumping synsets...");
    const synsets = db.prepare("SELECT * FROM synsets").all();
    for (const row of synsets as any[]) {
      sqlStatements.push(
        `INSERT INTO synsets (synset_offset, lex_file_num, pos_code, gloss) VALUES (${escape(row.synset_offset)}, ${escape(row.lex_file_num)}, ${escape(row.pos_code)}, ${escape(row.gloss)}) ON CONFLICT DO NOTHING;`
      );
    }
    console.log(`  ✓ ${synsets.length} rows`);

    // 5. Words
    console.log("Dumping words...");
    const words = db.prepare("SELECT * FROM words").all();
    for (const row of words as any[]) {
      sqlStatements.push(
        `INSERT INTO words (lemma, pos_code, synset_offset, lex_id) VALUES (${escape(row.lemma)}, ${escape(row.pos_code)}, ${escape(row.synset_offset)}, ${escape(row.lex_id)});`
      );
    }
    console.log(`  ✓ ${words.length} rows`);

    // 6. Pointers
    console.log("Dumping pointers...");
    const pointers = db.prepare("SELECT * FROM pointers").all();
    for (const row of pointers as any[]) {
      sqlStatements.push(
        `INSERT INTO pointers (source_synset_offset, pointer_symbol, target_synset_offset, source_target) VALUES (${escape(row.source_synset_offset)}, ${escape(row.pointer_symbol)}, ${escape(row.target_synset_offset)}, ${escape(row.source_target)});`
      );
    }
    console.log(`  ✓ ${pointers.length} rows`);

    // Write to file
    console.log("\nWriting SQL file...");
    const sqlContent = [
      "-- WordNet Data Dump",
      `-- Generated: ${new Date().toISOString()}`,
      "-- Tables: pos_types, lex_file_types, pointer_types, synsets, words, pointers",
      "",
      "-- Disable foreign key checks for faster insertion",
      "PRAGMA foreign_keys = OFF;",
      "",
      ...sqlStatements,
      "",
      "-- Re-enable foreign key checks",
      "PRAGMA foreign_keys = ON;",
    ].join("\n");

    writeFileSync(OUTPUT_PATH, sqlContent, "utf-8");

    const fileSizeMB = (Buffer.byteLength(sqlContent, "utf-8") / 1024 / 1024).toFixed(2);
    console.log(`\n✅ SQL dump created successfully!`);
    console.log(`File size: ${fileSizeMB} MB`);
    console.log(`Total statements: ${sqlStatements.length}`);
    console.log(`\nTo import to remote D1:`);
    console.log(`  wrangler d1 execute lingo-legends-db --remote --file=${OUTPUT_PATH}`);
  } catch (error) {
    console.error("\n❌ Error dumping data:", error);
    throw error;
  } finally {
    db.close();
  }
}

dumpWordNetData();
