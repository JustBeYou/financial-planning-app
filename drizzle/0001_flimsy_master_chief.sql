CREATE TABLE `financial-planning-app_debt_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`interest_rate` integer NOT NULL,
	`length_months` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `financial-planning-app_deposit_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`bank_name` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`start_date` text NOT NULL,
	`interest` integer NOT NULL,
	`length_months` integer NOT NULL,
	`maturity_date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `financial-planning-app_investment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`value` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`date` text NOT NULL,
	`estimated_yearly_interest` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `financial-planning-app_real_estate_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`value` integer NOT NULL,
	`currency` text DEFAULT 'RON' NOT NULL,
	`date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `financial-planning-app_user`(`id`) ON UPDATE no action ON DELETE no action
);
