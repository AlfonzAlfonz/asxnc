import { lock } from "./lock";

test("lock", async () => {
	const { promise, resolve } = lock();

	let resolved = false;
	promise.then(() => (resolved = true));

	resolve();

	await promise;
	expect(resolved).toBe(true);
});
