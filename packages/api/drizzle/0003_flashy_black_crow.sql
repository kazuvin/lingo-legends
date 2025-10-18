CREATE TABLE `unique_lemmas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lemma` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_lemmas_lemma_unique` ON `unique_lemmas` (`lemma`);
--> statement-breakpoint
INSERT INTO `unique_lemmas` (`lemma`)
SELECT DISTINCT `lemma` FROM `words` ORDER BY `lemma`;