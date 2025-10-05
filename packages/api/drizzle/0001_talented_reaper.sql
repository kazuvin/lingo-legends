ALTER TABLE `users_table` RENAME TO `users`;--> statement-breakpoint
CREATE TABLE `lex_file_types` (
	`file_num` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `pointer_types` (
	`symbol` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `pointers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_synset_offset` text NOT NULL,
	`pointer_symbol` text NOT NULL,
	`target_synset_offset` text NOT NULL,
	`source_target` text,
	FOREIGN KEY (`source_synset_offset`) REFERENCES `synsets`(`synset_offset`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pointer_symbol`) REFERENCES `pointer_types`(`symbol`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_synset_offset`) REFERENCES `synsets`(`synset_offset`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pointers_source` ON `pointers` (`source_synset_offset`,`pointer_symbol`);--> statement-breakpoint
CREATE INDEX `idx_pointers_target` ON `pointers` (`target_synset_offset`);--> statement-breakpoint
CREATE TABLE `pos_types` (
	`pos_code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `synsets` (
	`synset_offset` text PRIMARY KEY NOT NULL,
	`lex_file_num` integer NOT NULL,
	`pos_code` text NOT NULL,
	`gloss` text,
	FOREIGN KEY (`lex_file_num`) REFERENCES `lex_file_types`(`file_num`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pos_code`) REFERENCES `pos_types`(`pos_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_synsets_pos` ON `synsets` (`pos_code`);--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lemma` text NOT NULL,
	`pos_code` text NOT NULL,
	`synset_offset` text NOT NULL,
	`lex_id` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`pos_code`) REFERENCES `pos_types`(`pos_code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`synset_offset`) REFERENCES `synsets`(`synset_offset`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_words_lemma_pos` ON `words` (`lemma`,`pos_code`);--> statement-breakpoint
CREATE INDEX `idx_words_synset` ON `words` (`synset_offset`);--> statement-breakpoint
DROP INDEX `users_table_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);