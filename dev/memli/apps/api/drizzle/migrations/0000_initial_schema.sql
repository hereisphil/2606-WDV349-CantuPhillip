CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`position` integer NOT NULL,
	`term` text NOT NULL,
	`part_of_speech` text NOT NULL,
	`gender` text,
	`answers` text NOT NULL,
	`phonetic` text NOT NULL,
	`example_text` text NOT NULL,
	`example_translation` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "cards_part_of_speech_check" CHECK("cards"."part_of_speech" in ('noun', 'verb', 'adjective', 'adverb', 'phrase')),
	CONSTRAINT "cards_gender_check" CHECK("cards"."gender" is null or "cards"."gender" in ('masculine', 'feminine', 'neuter')),
	CONSTRAINT "cards_answers_check" CHECK(json_array_length("cards"."answers") > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cards_course_position_idx` ON `cards` (`course_id`,`position`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`learning_language` text NOT NULL,
	`answer_language` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `courses_learning_language_idx` ON `courses` (`learning_language`);--> statement-breakpoint
CREATE TABLE `mnemonics` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`author_id` text,
	`content_locale` text NOT NULL,
	`story` text NOT NULL,
	`upvotes` integer DEFAULT 0 NOT NULL,
	`image_src` text,
	`image_alt` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "mnemonics_upvotes_check" CHECK("mnemonics"."upvotes" >= 0),
	CONSTRAINT "mnemonics_story_check" CHECK(json_array_length("mnemonics"."story") > 0),
	CONSTRAINT "mnemonics_image_check" CHECK(("mnemonics"."image_src" is null) = ("mnemonics"."image_alt" is null))
);
--> statement-breakpoint
CREATE INDEX `mnemonics_card_idx` ON `mnemonics` (`card_id`);--> statement-breakpoint
CREATE TABLE `user_progress` (
	`user_id` text NOT NULL,
	`card_id` text NOT NULL,
	`state` text NOT NULL,
	`due` integer NOT NULL,
	`last_review` integer,
	`stability` real NOT NULL,
	`stability_fast` real NOT NULL,
	`difficulty` real NOT NULL,
	`reps` integer NOT NULL,
	`lapses` integer NOT NULL,
	`learning_step` integer NOT NULL,
	`scheduled_days` real NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `card_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "user_progress_state_check" CHECK("user_progress"."state" in ('new', 'learning', 'review', 'relearning')),
	CONSTRAINT "user_progress_counts_check" CHECK("user_progress"."reps" >= 0 and "user_progress"."lapses" >= 0 and "user_progress"."learning_step" >= 0)
);
--> statement-breakpoint
CREATE INDEX `user_progress_user_due_idx` ON `user_progress` (`user_id`,`due`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`ui_locale` text DEFAULT 'en' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);