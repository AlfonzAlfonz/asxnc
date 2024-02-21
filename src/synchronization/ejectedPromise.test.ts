import { ejectedPromise } from "./ejectedPromise";

test("ejectedPromise", async () => {
	const [promise, resolve] = ejectedPromise<number>();

	let result: number = 0;
	promise.then(() => (result = 99));

	resolve(99);

	await promise;
	expect(result).toBe(99);
});
