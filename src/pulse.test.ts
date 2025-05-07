import { pulse } from "./pulse";

test.only("pulse", async () => {
	jest.useFakeTimers();

	const controller = new AbortController();
	const iterator = pulse(100, "ms", controller.signal);

	let count = 0;

	(async () => {
		for await (const _ of iterator) {
			count++;
			if (count === 3) {
				controller.abort();
			}
		}
	})();

	await jest.advanceTimersByTimeAsync(100);
	expect(count).toBe(1);
	await jest.advanceTimersByTimeAsync(100);
	expect(count).toBe(2);
	await jest.advanceTimersByTimeAsync(100);
	expect(count).toBe(3);
	await jest.advanceTimersByTimeAsync(100);
	expect(count).toBe(3);
});
