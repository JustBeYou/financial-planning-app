import { db } from "~/server/db";
import { cashEntries, users } from "~/server/db/schema";

/**
 * Hardcoded users - should match the users in auth/config.ts
 */
const USERS = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
	},
	{
		id: "2",
		name: "Test User",
		email: "test@example.com",
	},
	{
		id: "3",
		name: "Demo User",
		email: "demo@example.com",
	},
];

/**
 * Seed script for populating the database with initial data
 */
async function seed() {
	console.log("🌱 Seeding database...");

	try {
		// Check if we already have users
		const existingUsers = await db.select().from(users);

		// If no users exist, create them
		if (existingUsers.length === 0) {
			console.log("Adding initial users...");
			await db.insert(users).values(USERS);
			console.log(`✅ Added ${USERS.length} users`);
		} else {
			console.log(
				`Found ${existingUsers.length} existing users, skipping user seed.`,
			);
		}

		// Check if we already have cash entries
		const existingEntries = await db.select().from(cashEntries);

		if (existingEntries.length === 0) {
			console.log("Adding initial cash entries...");

			// Use Admin User ID for initial data
			const adminUserId = USERS[0]?.id;

			// Initial cash entries data
			const initialCashEntries = [
				{
					userId: adminUserId,
					accountName: "Savings Account",
					amount: 15000,
					currency: "RON",
					date: "2023-11-15",
				},
				{
					userId: adminUserId,
					accountName: "Checking Account",
					amount: 3500,
					currency: "RON",
					date: "2023-11-20",
				},
				{
					userId: adminUserId,
					accountName: "Emergency Fund",
					amount: 25000,
					currency: "RON",
					date: "2023-10-05",
				},
				{
					userId: adminUserId,
					accountName: "Vacation Fund",
					amount: 7500,
					currency: "RON",
					date: "2023-11-01",
				},
				{
					userId: adminUserId,
					accountName: "Cash at Home",
					amount: 1200,
					currency: "RON",
					date: "2023-11-25",
				},
			];

			// Add some entries for Test User
			const testUserId = USERS[1]?.id;
			const testUserEntries = [
				{
					userId: testUserId,
					accountName: "Test Savings",
					amount: 5000,
					currency: "RON",
					date: "2023-12-01",
				},
				{
					userId: testUserId,
					accountName: "Test Checking",
					amount: 2000,
					currency: "RON",
					date: "2023-12-05",
				},
			];

			// Add some entries for Demo User
			const demoUserId = USERS[2]?.id;
			const demoUserEntries = [
				{
					userId: demoUserId,
					accountName: "Demo Savings",
					amount: 10000,
					currency: "RON",
					date: "2023-12-10",
				},
				{
					userId: demoUserId,
					accountName: "Demo Checking",
					amount: 3000,
					currency: "RON",
					date: "2023-12-15",
				},
			];

			// Insert all cash entries
			const allEntries = [
				...initialCashEntries,
				...testUserEntries,
				...demoUserEntries,
			];
			await db.insert(cashEntries).values(allEntries);
			console.log(
				`✅ Added ${allEntries.length} cash entries across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingEntries.length} existing cash entries, skipping seed.`,
			);
		}

		console.log("✅ Database seeding completed");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

// Run the seed function
void seed();
