import { collect } from "./collect.js";
import { Mutex } from "./Mutex.js";
import { wait } from "./wait.js";

describe("Util:MutexObject", () => {
	test("works properly with promises", async () => {
		const mutex = Mutex.create(null);

		const order: string[] = [];

		await Promise.all([
			(async () => {
				await mutex.acquire(async () => {
					order.push("a_start");
					await wait(20);
					order.push("a_end");
				});
			})(),
			(async () => {
				await wait(10);
				await mutex.acquire(async () => {
					order.push("b_start");
					await wait(1);
					order.push("b_end");
				});
			})(),
		]);

		expect(order).toMatchObject(["a_start", "a_end", "b_start", "b_end"]);
	});

	test("works properly with async generators", async () => {
		const mutex = Mutex.create(null);

		const order: string[] = [];

		const [a, b] = await Promise.all([
			(async () => {
				return await collect(
					await mutex.acquire(async function* () {
						yield order.push("a_start");
						await wait(20);
						yield order.push("a_end");
					}),
				);
			})(),
			(async () => {
				await wait(10);
				return await collect(
					await mutex.acquire(async function* () {
						yield order.push("b_start");
						await wait(1);
						yield order.push("b_end");
					}),
				);
			})(),
		]);
		expect(a).toMatchObject([1, 2]);
		expect(b).toMatchObject([3, 4]);

		expect(order).toMatchObject(["a_start", "a_end", "b_start", "b_end"]);
	});
});
