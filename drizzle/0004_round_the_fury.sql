CREATE TABLE `financial-planning-app_spendings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`allocation_id` integer NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`category` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`allocation_id`) REFERENCES `financial-planning-app_budget_allocations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `spending_allocation_id_idx` ON `financial-planning-app_spendings` (`allocation_id`);