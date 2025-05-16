import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { Lock } from "./Lock.js";

export type PylonIterator<T> = AsyncIterableIterator<T> & {
	read: () => Promise<T>;
	readSync: () => T | undefined;
};

export type Pylon<T> = LabeledTuple<
	[iterator: PylonIterator<T>, swap: (value: T) => void],
	{
		iterator: PylonIterator<T>;
		swap: (value: T) => void;
	}
>;

/**
 * TODO
 *
 * @category Collections
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

		const swap = async (v: T) => {
			value = v;
			writeLock.resolve();
		};

		return labeledTuple([iterator, swap], {
			iterator,
			swap,
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
