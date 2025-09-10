import { collect } from "./collect.js";

describe("collect", () => {
	test("yield", async () => {
		const it = (async function* () {
			yield 1;
			yield 2;
			yield 3;
		})();

		const numbers = await collect(it);
		expect(numbers).toEqual([1, 2, 3]);
	});

	test("yield & return", async () => {
		const it = (async function* () {
			yield 1;
			yield 2;
			yield 3;

			return 4;
		})();

		const numbers = await collect(it);
		expect(numbers).toEqual([1, 2, 3]);
	});
});
