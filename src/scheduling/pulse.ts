import { asyncIterableIterator } from "..";
import { lock, Lock } from "../synchronization/lock";
import { units } from "./wait";

export const pulse = (duration: number, unit: "ms" | "s" | "m" = "ms") => {
	let l: Lock | null = lock();

	const id = setInterval(() => {
		if (l) {
			l.release();
			l = lock();
		}
	}, duration * units[unit]);

	return asyncIterableIterator({
		next: async () => {
			if (l) {
				await l.handle;
				return { value: undefined, done: false };
			} else {
				return { value: undefined, done: true };
			}
		},
		cancel: () => {
			clearInterval(id);
			l = null;
		},
	});
};
