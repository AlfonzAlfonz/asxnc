import { pulse } from "./pulse";

test("pulse", async () => {
	const iterator = pulse(100);

	let count = 0;

	const before = performance.now();

	for await (const _ of iterator) {
		count++;
		if (count === 3) {
			iterator.cancel();
		}
	}

	const after = performance.now() - before;

	expect(count).toBe(3);
	expect(after).toBeGreaterThan(300);
	expect(after).toBeLessThan(350);
});
