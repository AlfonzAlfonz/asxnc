import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { EjectedPromise } from "./EjectedPromise.js";
import { Lock } from "./Lock.js";
import { iteratorResult, IteratorResultTuple } from "./.internal/utils.js";

export type PubSub<T> = LabeledTuple<
	[
		iterator: AsyncIterableIterator<T>,
		dispatch: (...args: IteratorResultTuple<T, undefined>) => Promise<void>,
		reject: (value: unknown) => Promise<void>,
	],
	{
		iterator: AsyncIterableIterator<T>;
		dispatch: (...args: IteratorResultTuple<T, undefined>) => Promise<void>;
		swap: (...args: IteratorResultTuple<T, undefined>) => void;
		reject: (value: unknown) => Promise<void>;
	}
>;

/**
 * Pubsub is a 1-reader 1-writer data structure, which allows a single producers
 * to dispatch data and a single consumer to consume them. Only the last
 * dispatched value is stored and writer needs to wait for the reader to prevent
 * data loss.
 */
export const Pubsub = {
	create: <T>(): PubSub<T> => {
		type Value = IteratorResult<T>;

		let lock = Lock.create();
		let p = EjectedPromise.create<Value>();

		const iterator = asyncIterableIterator({
			next: async () => {
				lock.resolve();

				const result = await p.promise;
				lock = Lock.create();
				return result;
			},
		});

		const dispatch = async (...args: IteratorResultTuple<T, undefined>) => {
			await lock.promise;
			p.resolve(iteratorResult(args));
			p = EjectedPromise.create<Value>();
		};

		const swap = async (...args: IteratorResultTuple<T, undefined>) => {
			await lock.promise;
			p.resolve(iteratorResult(args));
			p = EjectedPromise.create<Value>();
		};

		const reject = async (e: unknown) => {
			await lock.promise;
			reject(e);
			p = EjectedPromise.create<Value>();
		};

		return labeledTuple([iterator, dispatch, reject], {
			iterator,
			dispatch,
			swap,
			reject,
		});
	},
};
