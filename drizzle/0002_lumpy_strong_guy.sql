CREATE TABLE `financial-planning-app_budget_allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`value` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`type` text DEFAULT 'monthly' NOT NULL,
	`value_type` text DEFAULT 'absolute' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `budget_allocation_user_id_idx` ON `financial-planning-app_budget_allocations` (`user_id`);--> statement-breakpoint
CREATE TABLE `financial-planning-app_income_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`type` text DEFAULT 'monthly' NOT NULL,
	`tax_percentage` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `income_source_user_id_idx` ON `financial-planning-app_income_sources` (`user_id`);