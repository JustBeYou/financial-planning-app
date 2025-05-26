import { cashRouter } from "~/server/api/routers/cash";
import { debtRouter } from "~/server/api/routers/debt";
import { depositsRouter } from "~/server/api/routers/deposits";
import { investmentsRouter } from "~/server/api/routers/investments";
import { netWorthRouter } from "~/server/api/routers/netWorth";
import { realEstateRouter } from "~/server/api/routers/realEstate";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	// Add your routers here when you create them
	netWorth: netWorthRouter,
	debt: debtRouter,
	deposits: depositsRouter,
	realEstate: realEstateRouter,
	investments: investmentsRouter,
	cash: cashRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.example.hello();
 */
export const createCaller = createCallerFactory(appRouter);
