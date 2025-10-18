CREATE TABLE `translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`synset_offset` text NOT NULL,
	`language_code` text NOT NULL,
	`translated_gloss` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`synset_offset`) REFERENCES `synsets`(`synset_offset`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_translations_synset_lang` ON `translations` (`synset_offset`,`language_code`);