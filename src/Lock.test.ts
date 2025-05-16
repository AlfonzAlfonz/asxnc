import { Lock } from "./Lock.js";

test("Lock", async () => {
	const { promise, resolve } = Lock.create();

	let resolved = false;
	promise.then(() => (resolved = true));

	resolve();

	await promise;
	expect(resolved).toBe(true);
});
