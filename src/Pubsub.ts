import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { EjectedPromise } from "./EjectedPromise.js";
import { Lock } from "./Lock.js";

export type PubSub<T> = LabeledTuple<
	[
		iterator: AsyncIterableIterator<T>,
		dispatch: (value: IteratorResult<T>) => Promise<void>,
		reject: (value: unknown) => Promise<void>,
	],
	{
		iterator: AsyncIterableIterator<T>;
		dispatch: (value: IteratorResult<T>) => Promise<void>;
		reject: (value: unknown) => Promise<void>;
	}
>;

/**
 * Pubsub is a 1-reader 1-writer data structure, which allows a single producers
 * to dispatch data and a single consumer to consume them. Only the last
 * dispatched value is stored and writer needs to wait for the reader to prevent
 * data loss.
 *
 * @category Collections
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

		const dispatch = async (value: IteratorResult<T>) => {
			await lock.promise;
			p.resolve(value);
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
			reject,
		});
	},
};
