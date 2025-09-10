import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { Lock } from "./Lock.js";

export type PylonIterator<T> = AsyncIterableIterator<T> & {
	read: () => Promise<T>;
	readSync: () => T | undefined;
};

export type PylonSwap<T> = (v: T | ((prev: T) => T)) => void;

export type Pylon<T> = LabeledTuple<
	[iterator: PylonIterator<T>, swap: PylonSwap<T>],
	{
		iterator: PylonIterator<T>;
		swap: PylonSwap<T>;
		bump: () => void;
	}
>;

/**
 * Pylon is a special data structure, which hold a single value and whenever 
 * this value is updated, it signals to all subscribers about the new value. 
 * Values of the pylon are buffered, so all subscribers will receive all change 
 * events (even if the producer updates more quickly than the subscriber can 
 * handle at the moment).
 */
export const Pylon = {
	create: <T>(): Pylon<T> => {
		let value: T | undefined = undefined;

		let writeLock = Lock.create();

		const iterator = asyncIterableIterator({
			read: async (): Promise<T> => {
				if (value) {
					return value;
				}
				await writeLock.promise;
				return value!;
			},
			readSync: () => value,
			next: async () => {
				await writeLock.promise;

				writeLock = Lock.create();
				return { value: value!, done: false };
			},
		});

		const swap: PylonSwap<T> = async (v) => {
			value = typeof v === "function" ? (v as any)(value) : v;
			writeLock.resolve();
		};

		const bump = () => {
			writeLock.resolve();
		};

		return labeledTuple([iterator, swap], {
			iterator,
			swap,
			bump,
		});
	},
	map: <T, U>(source: PylonIterator<T>, fn: (x: T) => U): PylonIterator<U> => {
		return asyncIterableIterator({
			read: async (): Promise<U> => source.read().then(fn),
			readSync: () => {
				const val = source.readSync();
				if (val) {
					return fn(val);
				}
			},
			next: async () => {
				const result = await source.next();
				if (result.done) {
					return result;
				} else {
					return { value: fn(result.value), done: false };
				}
			},
		});
	},
};
