CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`card_id` text NOT NULL,
	`outcome` text NOT NULL,
	`rating` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`duration_ms` integer,
	`prior_state` text NOT NULL,
	`prior_due` integer NOT NULL,
	`prior_last_review` integer,
	`prior_stability` real NOT NULL,
	`prior_stability_fast` real NOT NULL,
	`prior_difficulty` real NOT NULL,
	`prior_learning_step` integer NOT NULL,
	`prior_scheduled_days` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reviews_outcome_check" CHECK("reviews"."outcome" in ('missed', 'tough', 'got_it', 'easy')),
	CONSTRAINT "reviews_rating_check" CHECK("reviews"."rating" between 1 and 4),
	CONSTRAINT "reviews_duration_check" CHECK("reviews"."duration_ms" is null or "reviews"."duration_ms" >= 0),
	CONSTRAINT "reviews_prior_state_check" CHECK("reviews"."prior_state" in ('new', 'learning', 'review', 'relearning'))
);
--> statement-breakpoint
CREATE INDEX `reviews_user_reviewed_at_idx` ON `reviews` (`user_id`,`reviewed_at`);