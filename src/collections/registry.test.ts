import { jest } from "@jest/globals";
import { fork } from "../utils/fork";
import { registry } from "./registry";
import { wait } from "../scheduling/wait";

interface Db {
	select: () => any;
	update: () => any;
}

interface UserRepository {
	getUsers: () => any;
}

interface ProductRepository {
	getProducts: () => any;
}

test("registry", async () => {
	const ctx = registry<
		["db", Db] | ["users", UserRepository] | ["products", ProductRepository]
	>();

	const mockedDb = {
		select: jest.fn(),
		update: jest.fn(),
	};

	const main = async () => {
		const db = await ctx.waitFor("db");

		db.select();
	};

	const db = async () => {
		await wait(10);
		ctx.register("db", mockedDb);
	};

	await fork(
		main,
		db,
		async () => {
			const db = await ctx.waitFor("db");
			const products = await ctx.waitFor("products");

			await wait(10);
			ctx.register("users", {
				getUsers: () => db.select(),
			});
		},
		async () => {
			const db = await ctx.waitFor("db");
			// const users = await waitFor("users");

			ctx.register("products", {
				getProducts: () => db.select(),
			});
		},
	);

	expect(mockedDb.select.mock.calls).toHaveLength(1);
});
