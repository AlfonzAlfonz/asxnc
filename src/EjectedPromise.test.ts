import { EjectedPromise } from "./EjectedPromise";

test("EjectedPromise", async () => {
	const [promise, resolve] = EjectedPromise.create<number>();

	let result: number = 0;
	promise.then(() => (result = 99));

	resolve(99);

	await promise;
	expect(result).toBe(99);
});
