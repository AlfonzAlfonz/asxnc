import { ejectedPromise } from "../synchronization/ejectedPromise";
import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";
import { Prettify } from "../utils/types";

export type Registry<TEntry extends [unknown, unknown]> = LabeledTuple<
	readonly [
		<T extends TEntry[0]>(
			key: T,
		) => Promise<Prettify<TEntry & [T, unknown]>[1]>,
		(...[key, value]: TEntry) => void,
		<T extends TEntry[0]>(key: T) => Prettify<TEntry & [T, unknown]>[1],
	],
	readonly ["waitFor", "register", "getSync"]
>;

export const registry = <
	TEntry extends [string, unknown],
>(): Registry<TEntry> => {
	const map = new Map();
	const subscribers = new Map<unknown, ((v: unknown) => void)[]>();

	return labeledTuple(
		[
			async <T extends TEntry[0]>(
				key: T,
			): Promise<Prettify<TEntry & [T, unknown]>[1]> => {
				const val = map.get(key);
				if (val) {
					return val;
				}

				const [promise, resolve] =
					ejectedPromise<Prettify<TEntry & [T, unknown]>[1]>();

				if (subscribers.has(key)) {
					subscribers.get(key)!.push(resolve);
				} else {
					subscribers.set(key, [resolve]);
				}

				return promise;
			},
			(...[key, value]: TEntry) => {
				if (map.has(key)) {
					throw new Error(`Registry already contains key ${key}`);
				}
				map.set(key, value);

				while (subscribers.get(key)?.length) {
					const s = subscribers.get(key)?.shift()!;
					s(value);
				}
			},
			(key) => {
				const value = map.get(key);
				if (!value) {
					throw new Error(`Key ${key} is missing.`);
				}
				return value;
			},
		] as const,
		["waitFor", "register", "getSync"],
	);
};
