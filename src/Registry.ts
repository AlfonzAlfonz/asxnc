import { EjectedPromise } from "./EjectedPromise.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { Prettify } from "./.internal/types.js";

export type Registry<TEntry extends [unknown, unknown]> = LabeledTuple<
	[
		waitFor: <T extends TEntry[0]>(
			key: T,
		) => Promise<Prettify<TEntry & [T, unknown]>[1]>,
		register: (...[key, value]: TEntry) => void,
		getSync: <T extends TEntry[0]>(
			key: T,
		) => Prettify<TEntry & [T, unknown]>[1],
	],
	{
		waitFor: <T extends TEntry[0]>(
			key: T,
		) => Promise<Prettify<TEntry & [T, unknown]>[1]>;
		register: (...[key, value]: TEntry) => void;
		getSync: <T extends TEntry[0]>(
			key: T,
		) => Prettify<TEntry & [T, unknown]>[1];
	}
>;

/**
 * Registry is a dictionary-like data structure for storing key-value data.
 * Multiple consumers may wait (using `waitFor()`) for registering (using
 * `register()`) a new value for a given key.
 */
export const Registry = {
	create: <TEntry extends [string, unknown]>(): Registry<TEntry> => {
		const map = new Map();
		const subscribers = new Map<unknown, ((v: unknown) => void)[]>();

		const waitFor = async <T extends TEntry[0]>(
			key: T,
		): Promise<Prettify<TEntry & [T, unknown]>[1]> => {
			const val = map.get(key);
			if (val) {
				return val;
			}

			const [promise, resolve] =
				EjectedPromise.create<Prettify<TEntry & [T, unknown]>[1]>();

			if (subscribers.has(key)) {
				subscribers.get(key)!.push(resolve);
			} else {
				subscribers.set(key, [resolve]);
			}

			return promise;
		};
		const register = (...[key, value]: TEntry) => {
			if (map.has(key)) {
				throw new Error(`Registry already contains key ${key}`);
			}
			map.set(key, value);

			while (subscribers.get(key)?.length) {
				const s = subscribers.get(key)?.shift()!;
				s(value);
			}
		};
		const getSync = <T extends TEntry[0]>(
			key: T,
		): Prettify<TEntry & [T, unknown]>[1] => {
			const value = map.get(key);
			if (!value) {
				throw new Error(`Key ${key} is missing.`);
			}
			return value;
		};

		return labeledTuple([waitFor, register, getSync], {
			waitFor,
			register,
			getSync,
		});
	},
};
