import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Hardcoded users for authentication
 */
const HARDCODED_USERS = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		username: "admin",
		password: "admin123",
	},
	{
		id: "2",
		name: "Test User",
		email: "test@example.com",
		username: "test",
		password: "test123",
	},
	{
		id: "3",
		name: "Demo User",
		email: "demo@example.com",
		username: "demo",
		password: "demo123",
	},
	{
		id: "4",
		name: "littlewho",
		email: "littlewho@example.com",
		username: "littlewho",
		password: "littlewho123",
	},
];

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				username: {
					label: "Username",
					type: "text",
					placeholder: "Enter username",
				},
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				// Find user in hardcoded list
				const user = HARDCODED_USERS.find(
					(u) =>
						u.username === credentials.username &&
						u.password === credentials.password,
				);

				if (user) {
					// Return user object without password
					const { password, ...userWithoutPassword } = user;
					return userWithoutPassword;
				}

				return null;
			},
		}),
		/**
		 * ...add more providers here.
		 *
		 * Some providers require additional configuration. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
	session: {
		strategy: "jwt", // Required for credentials provider
	},
	callbacks: {
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.sub ?? "", // Use token.sub as user id for JWT sessions
			},
		}),
		jwt: ({ token, user }) => {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
	},
} satisfies NextAuthConfig;
