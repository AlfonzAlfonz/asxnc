import { lock, Lock } from "./lock";
import { asyncIterableIterator } from "./.internal/asyncIterableIterator";
import { units } from "./wait";

/**
 * The `pulse()` function returns an async iterator which yields in set interval
 * by duration.
 *
 * @category Scheduling
 *
 * @example
 * for (const _ of pulse(200, "ms")) {
 *   console.log("hello");
 * }
 */
export const pulse = (
	duration: number,
	unit: "ms" | "s" | "m" = "ms",
	signal: AbortSignal | undefined,
) => {
	let l: Lock | null = lock();

	const id = setInterval(() => {
		if (l) {
			l.resolve();
			l = lock();
		}
	}, duration * units[unit]);

	signal?.addEventListener("abort", () => clearInterval(id));

	return asyncIterableIterator({
		next: async () => {
			if (l) {
				await l.promise;
				return { value: undefined, done: false };
			} else {
				return { value: undefined, done: true };
			}
		},
	});
};
