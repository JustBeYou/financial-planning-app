import { db } from "~/server/db";
import {
	budgetAllocations,
	cashEntries,
	debtEntries,
	depositEntries,
	incomeSources,
	investments,
	realEstateEntries,
	users,
} from "~/server/db/schema";

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

// Get user IDs as constants to avoid type issues
const ADMIN_ID = USERS[0]?.id;
const TEST_ID = USERS[1]?.id;
const DEMO_ID = USERS[2]?.id;

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
		const existingCashEntries = await db.select().from(cashEntries);

		if (existingCashEntries.length === 0) {
			console.log("Adding initial cash entries...");

			// Initial cash entries data
			const initialCashEntries = [
				{
					userId: ADMIN_ID,
					accountName: "Savings Account",
					amount: 15000,
					currency: "RON",
					date: "2023-11-15",
				},
				{
					userId: ADMIN_ID,
					accountName: "Checking Account",
					amount: 3500,
					currency: "RON",
					date: "2023-11-20",
				},
				{
					userId: ADMIN_ID,
					accountName: "Emergency Fund",
					amount: 25000,
					currency: "RON",
					date: "2023-10-05",
				},
				{
					userId: ADMIN_ID,
					accountName: "Vacation Fund",
					amount: 7500,
					currency: "RON",
					date: "2023-11-01",
				},
				{
					userId: ADMIN_ID,
					accountName: "Cash at Home",
					amount: 1200,
					currency: "RON",
					date: "2023-11-25",
				},
			];

			// Add some entries for Test User
			const testUserEntries = [
				{
					userId: TEST_ID,
					accountName: "Test Savings",
					amount: 5000,
					currency: "RON",
					date: "2023-12-01",
				},
				{
					userId: TEST_ID,
					accountName: "Test Checking",
					amount: 2000,
					currency: "RON",
					date: "2023-12-05",
				},
			];

			// Add some entries for Demo User
			const demoUserEntries = [
				{
					userId: DEMO_ID,
					accountName: "Demo Savings",
					amount: 10000,
					currency: "RON",
					date: "2023-12-10",
				},
				{
					userId: DEMO_ID,
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
				`Found ${existingCashEntries.length} existing cash entries, skipping seed.`,
			);
		}

		// Check if we already have investment entries
		const existingInvestments = await db.select().from(investments);

		if (existingInvestments.length === 0) {
			console.log("Adding initial investment entries...");

			// Initial investment entries data
			const initialInvestments = [
				{
					userId: ADMIN_ID,
					name: "Stock Portfolio",
					value: 75000,
					currency: "RON",
					date: "2023-11-30",
					estimatedYearlyInterest: 85, // 8.5%
				},
				{
					userId: ADMIN_ID,
					name: "Index Fund",
					value: 120000,
					currency: "RON",
					date: "2023-11-28",
					estimatedYearlyInterest: 72, // 7.2%
				},
				{
					userId: ADMIN_ID,
					name: "Corporate Bonds",
					value: 50000,
					currency: "RON",
					date: "2023-10-15",
					estimatedYearlyInterest: 58, // 5.8%
				},
				{
					userId: ADMIN_ID,
					name: "Real Estate Fund",
					value: 200000,
					currency: "RON",
					date: "2023-09-01",
					estimatedYearlyInterest: 65, // 6.5%
				},
				{
					userId: ADMIN_ID,
					name: "Cryptocurrency",
					value: 30000,
					currency: "RON",
					date: "2023-11-15",
					estimatedYearlyInterest: 120, // 12.0%
				},
			];

			// Add entries for test user
			const testUserInvestments = [
				{
					userId: TEST_ID,
					name: "Test Stocks",
					value: 25000,
					currency: "RON",
					date: "2023-12-01",
					estimatedYearlyInterest: 80, // 8.0%
				},
			];

			// Add entries for demo user
			const demoUserInvestments = [
				{
					userId: DEMO_ID,
					name: "Demo ETF",
					value: 45000,
					currency: "RON",
					date: "2023-12-10",
					estimatedYearlyInterest: 70, // 7.0%
				},
			];

			// Insert all investment entries
			const allInvestments = [
				...initialInvestments,
				...testUserInvestments,
				...demoUserInvestments,
			];
			await db.insert(investments).values(allInvestments);
			console.log(
				`✅ Added ${allInvestments.length} investment entries across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingInvestments.length} existing investment entries, skipping seed.`,
			);
		}

		// Check if we already have real estate entries
		const existingRealEstate = await db.select().from(realEstateEntries);

		if (existingRealEstate.length === 0) {
			console.log("Adding initial real estate entries...");

			// Initial real estate entries data
			const initialRealEstate = [
				{
					userId: ADMIN_ID,
					name: "Primary Residence",
					value: 450000,
					currency: "RON",
					date: "2023-10-15",
				},
				{
					userId: ADMIN_ID,
					name: "Rental Apartment",
					value: 320000,
					currency: "RON",
					date: "2023-11-01",
				},
				{
					userId: ADMIN_ID,
					name: "Vacation Property",
					value: 280000,
					currency: "RON",
					date: "2023-09-20",
				},
				{
					userId: ADMIN_ID,
					name: "Land Investment",
					value: 150000,
					currency: "RON",
					date: "2023-08-05",
				},
			];

			// Add entries for test user
			const testUserRealEstate = [
				{
					userId: TEST_ID,
					name: "Test Apartment",
					value: 250000,
					currency: "RON",
					date: "2023-12-01",
				},
			];

			// Add entries for demo user
			const demoUserRealEstate = [
				{
					userId: DEMO_ID,
					name: "Demo House",
					value: 350000,
					currency: "RON",
					date: "2023-12-10",
				},
			];

			// Insert all real estate entries
			const allRealEstate = [
				...initialRealEstate,
				...testUserRealEstate,
				...demoUserRealEstate,
			];
			await db.insert(realEstateEntries).values(allRealEstate);
			console.log(
				`✅ Added ${allRealEstate.length} real estate entries across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingRealEstate.length} existing real estate entries, skipping seed.`,
			);
		}

		// Check if we already have debt entries
		const existingDebt = await db.select().from(debtEntries);

		if (existingDebt.length === 0) {
			console.log("Adding initial debt entries...");

			// Initial debt entries data
			const initialDebt = [
				{
					userId: ADMIN_ID,
					name: "Mortgage",
					amount: 320000,
					currency: "RON",
					interestRate: 425, // 4.25%
					lengthMonths: 240, // 20 years
				},
				{
					userId: ADMIN_ID,
					name: "Car Loan",
					amount: 45000,
					currency: "RON",
					interestRate: 575, // 5.75%
					lengthMonths: 60, // 5 years
				},
				{
					userId: ADMIN_ID,
					name: "Student Loan",
					amount: 25000,
					currency: "RON",
					interestRate: 380, // 3.8%
					lengthMonths: 120, // 10 years
				},
				{
					userId: ADMIN_ID,
					name: "Personal Loan",
					amount: 12000,
					currency: "RON",
					interestRate: 850, // 8.5%
					lengthMonths: 36, // 3 years
				},
				{
					userId: ADMIN_ID,
					name: "Credit Card",
					amount: 7500,
					currency: "RON",
					interestRate: 1890, // 18.9%
					lengthMonths: 12, // 1 year
				},
			];

			// Add entries for test user
			const testUserDebt = [
				{
					userId: TEST_ID,
					name: "Test Mortgage",
					amount: 200000,
					currency: "RON",
					interestRate: 450, // 4.5%
					lengthMonths: 300, // 25 years
				},
			];

			// Add entries for demo user
			const demoUserDebt = [
				{
					userId: DEMO_ID,
					name: "Demo Car Loan",
					amount: 30000,
					currency: "RON",
					interestRate: 600, // 6.0%
					lengthMonths: 48, // 4 years
				},
			];

			// Insert all debt entries
			const allDebt = [...initialDebt, ...testUserDebt, ...demoUserDebt];
			await db.insert(debtEntries).values(allDebt);
			console.log(
				`✅ Added ${allDebt.length} debt entries across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingDebt.length} existing debt entries, skipping seed.`,
			);
		}

		// Check if we already have deposit entries
		const existingDeposits = await db.select().from(depositEntries);

		if (existingDeposits.length === 0) {
			console.log("Adding initial deposit entries...");

			// Calculate maturity date
			const calculateMaturityDate = (
				startDate: string,
				lengthMonths: number,
			): string => {
				const date = new Date(startDate);
				date.setMonth(date.getMonth() + lengthMonths);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const day = String(date.getDate()).padStart(2, "0");
				return `${year}-${month}-${day}`;
			};

			// Initial deposit entries data
			const initialDeposits = [
				{
					userId: ADMIN_ID,
					bankName: "First Bank",
					amount: 50000,
					currency: "RON",
					startDate: "2023-10-01",
					interest: 525, // 5.25%
					lengthMonths: 12,
					maturityDate: calculateMaturityDate("2023-10-01", 12),
				},
				{
					userId: ADMIN_ID,
					bankName: "Credit Union",
					amount: 25000,
					currency: "RON",
					startDate: "2023-11-15",
					interest: 475, // 4.75%
					lengthMonths: 6,
					maturityDate: calculateMaturityDate("2023-11-15", 6),
				},
				{
					userId: ADMIN_ID,
					bankName: "National Bank",
					amount: 100000,
					currency: "RON",
					startDate: "2023-09-10",
					interest: 600, // 6.0%
					lengthMonths: 24,
					maturityDate: calculateMaturityDate("2023-09-10", 24),
				},
				{
					userId: ADMIN_ID,
					bankName: "City Bank",
					amount: 30000,
					currency: "RON",
					startDate: "2023-12-01",
					interest: 550, // 5.5%
					lengthMonths: 18,
					maturityDate: calculateMaturityDate("2023-12-01", 18),
				},
			];

			// Add entries for test user
			const testUserDeposits = [
				{
					userId: TEST_ID,
					bankName: "Test Bank",
					amount: 15000,
					currency: "RON",
					startDate: "2023-12-01",
					interest: 500, // 5.0%
					lengthMonths: 12,
					maturityDate: calculateMaturityDate("2023-12-01", 12),
				},
			];

			// Add entries for demo user
			const demoUserDeposits = [
				{
					userId: DEMO_ID,
					bankName: "Demo Bank",
					amount: 20000,
					currency: "RON",
					startDate: "2023-12-10",
					interest: 520, // 5.2%
					lengthMonths: 6,
					maturityDate: calculateMaturityDate("2023-12-10", 6),
				},
			];

			// Insert all deposit entries
			const allDeposits = [
				...initialDeposits,
				...testUserDeposits,
				...demoUserDeposits,
			];
			await db.insert(depositEntries).values(allDeposits);
			console.log(
				`✅ Added ${allDeposits.length} deposit entries across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingDeposits.length} existing deposit entries, skipping seed.`,
			);
		}

		// Check if we already have income sources
		const existingIncomeSources = await db.select().from(incomeSources);

		if (existingIncomeSources.length === 0) {
			console.log("Adding initial income sources...");

			// Initial income sources data
			const initialIncomeSources = [
				{
					userId: ADMIN_ID,
					name: "Salary",
					amount: 8500,
					currency: "RON",
					type: "monthly",
					taxPercentage: 40,
				},
				{
					userId: ADMIN_ID,
					name: "Side Project",
					amount: 2500,
					currency: "RON",
					type: "monthly",
					taxPercentage: 10,
				},
				{
					userId: ADMIN_ID,
					name: "Yearly Bonus",
					amount: 15000,
					currency: "RON",
					type: "yearly",
					taxPercentage: 40,
				},
				{
					userId: ADMIN_ID,
					name: "Dividend Income",
					amount: 5000,
					currency: "RON",
					type: "yearly",
					taxPercentage: 5,
				},
			];

			// Add entries for test user
			const testUserIncomeSources = [
				{
					userId: TEST_ID,
					name: "Test Salary",
					amount: 7000,
					currency: "RON",
					type: "monthly",
					taxPercentage: 35,
				},
				{
					userId: TEST_ID,
					name: "Test Bonus",
					amount: 10000,
					currency: "RON",
					type: "yearly",
					taxPercentage: 35,
				},
			];

			// Add entries for demo user
			const demoUserIncomeSources = [
				{
					userId: DEMO_ID,
					name: "Demo Salary",
					amount: 9000,
					currency: "RON",
					type: "monthly",
					taxPercentage: 40,
				},
				{
					userId: DEMO_ID,
					name: "Demo Freelance",
					amount: 3000,
					currency: "RON",
					type: "monthly",
					taxPercentage: 10,
				},
			];

			// Insert all income source entries
			const allIncomeSources = [
				...initialIncomeSources,
				...testUserIncomeSources,
				...demoUserIncomeSources,
			];
			await db.insert(incomeSources).values(allIncomeSources);
			console.log(
				`✅ Added ${allIncomeSources.length} income sources across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingIncomeSources.length} existing income sources, skipping seed.`,
			);
		}

		// Check if we already have budget allocations
		const existingBudgetAllocations = await db.select().from(budgetAllocations);

		if (existingBudgetAllocations.length === 0) {
			console.log("Adding initial budget allocations...");

			// Initial budget allocations data
			const initialBudgetAllocations = [
				{
					userId: ADMIN_ID,
					name: "Housing",
					value: 2500,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: ADMIN_ID,
					name: "Food",
					value: 1500,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: ADMIN_ID,
					name: "Transportation",
					value: 800,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: ADMIN_ID,
					name: "Utilities",
					value: 600,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: ADMIN_ID,
					name: "Savings",
					value: 20,
					currency: "RON",
					type: "monthly",
					valueType: "percent",
				},
				{
					userId: ADMIN_ID,
					name: "Investments",
					value: 15,
					currency: "RON",
					type: "monthly",
					valueType: "percent",
				},
				{
					userId: ADMIN_ID,
					name: "Vacation Fund",
					value: 10000,
					currency: "RON",
					type: "yearly",
					valueType: "absolute",
				},
			];

			// Add entries for test user
			const testUserBudgetAllocations = [
				{
					userId: TEST_ID,
					name: "Test Housing",
					value: 2000,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: TEST_ID,
					name: "Test Savings",
					value: 25,
					currency: "RON",
					type: "monthly",
					valueType: "percent",
				},
			];

			// Add entries for demo user
			const demoUserBudgetAllocations = [
				{
					userId: DEMO_ID,
					name: "Demo Rent",
					value: 2200,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: DEMO_ID,
					name: "Demo Food",
					value: 1200,
					currency: "RON",
					type: "monthly",
					valueType: "absolute",
				},
				{
					userId: DEMO_ID,
					name: "Demo Investments",
					value: 30,
					currency: "RON",
					type: "monthly",
					valueType: "percent",
				},
			];

			// Insert all budget allocation entries
			const allBudgetAllocations = [
				...initialBudgetAllocations,
				...testUserBudgetAllocations,
				...demoUserBudgetAllocations,
			];
			await db.insert(budgetAllocations).values(allBudgetAllocations);
			console.log(
				`✅ Added ${allBudgetAllocations.length} budget allocations across ${USERS.length} users`,
			);
		} else {
			console.log(
				`Found ${existingBudgetAllocations.length} existing budget allocations, skipping seed.`,
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
