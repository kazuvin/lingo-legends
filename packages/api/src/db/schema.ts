import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});

export const posTypesTable = sqliteTable("pos_types", {
  posCode: text("pos_code").primaryKey(),
  name: text().notNull(),
  description: text(),
});

export const lexFileTypesTable = sqliteTable("lex_file_types", {
  fileNum: int("file_num").primaryKey(),
  name: text().notNull(),
  description: text(),
});

export const pointerTypesTable = sqliteTable("pointer_types", {
  symbol: text().primaryKey(),
  name: text().notNull(),
  description: text(),
});

export const synsetsTable = sqliteTable(
  "synsets",
  {
    synsetOffset: text("synset_offset").primaryKey(),
    lexFileNum: int("lex_file_num")
      .notNull()
      .references(() => lexFileTypesTable.fileNum),
    posCode: text("pos_code")
      .notNull()
      .references(() => posTypesTable.posCode),
    gloss: text(),
  },
  (table) => [index("idx_synsets_pos").on(table.posCode)],
);

export const wordsTable = sqliteTable(
  "words",
  {
    id: int().primaryKey({ autoIncrement: true }),
    lemma: text().notNull(),
    posCode: text("pos_code")
      .notNull()
      .references(() => posTypesTable.posCode),
    synsetOffset: text("synset_offset")
      .notNull()
      .references(() => synsetsTable.synsetOffset, { onDelete: "cascade" }),
    lexId: int("lex_id").notNull().default(0),
  },
  (table) => [
    index("idx_words_lemma_pos").on(table.lemma, table.posCode),
    index("idx_words_synset").on(table.synsetOffset),
  ],
);

export const pointersTable = sqliteTable(
  "pointers",
  {
    id: int().primaryKey({ autoIncrement: true }),
    sourceSynsetOffset: text("source_synset_offset")
      .notNull()
      .references(() => synsetsTable.synsetOffset, { onDelete: "cascade" }),
    pointerSymbol: text("pointer_symbol")
      .notNull()
      .references(() => pointerTypesTable.symbol),
    targetSynsetOffset: text("target_synset_offset")
      .notNull()
      .references(() => synsetsTable.synsetOffset, { onDelete: "cascade" }),
    sourceTarget: text("source_target"),
  },
  (table) => [
    index("idx_pointers_source").on(
      table.sourceSynsetOffset,
      table.pointerSymbol,
    ),
    index("idx_pointers_target").on(table.targetSynsetOffset),
  ],
);

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);

export const insertPosTypeSchema = createInsertSchema(posTypesTable);
export const selectPosTypeSchema = createSelectSchema(posTypesTable);

export const insertLexFileTypeSchema = createInsertSchema(lexFileTypesTable);
export const selectLexFileTypeSchema = createSelectSchema(lexFileTypesTable);

export const insertPointerTypeSchema = createInsertSchema(pointerTypesTable);
export const selectPointerTypeSchema = createSelectSchema(pointerTypesTable);

export const insertSynsetSchema = createInsertSchema(synsetsTable);
export const selectSynsetSchema = createSelectSchema(synsetsTable);

export const insertWordSchema = createInsertSchema(wordsTable);
export const selectWordSchema = createSelectSchema(wordsTable);

export const insertPointerSchema = createInsertSchema(pointersTable);
export const selectPointerSchema = createSelectSchema(pointersTable);
