import { Lock } from "./Lock.js";
import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { units } from "./wait.js";

/**
 * The `pulse()` function returns an async iterator which yields in set interval
 * by duration.
 *
 * @example
 * for await (const _ of pulse(200, "ms")) {
 *   console.log("hello");
 * }
 */
export const pulse = (
	duration: number,
	unit: "ms" | "s" | "m" = "ms",
	signal: AbortSignal | undefined,
) => {
	let lock: Lock | null = Lock.create();

	const id = setInterval(() => {
		if (lock) {
			lock.resolve();
			lock = Lock.create();
		}
	}, duration * units[unit]);

	signal?.addEventListener("abort", () => clearInterval(id));

	return asyncIterableIterator({
		next: async () => {
			if (lock) {
				await lock.promise;
				return { value: undefined, done: false };
			} else {
				return { value: undefined, done: true };
			}
		},
	});
};
