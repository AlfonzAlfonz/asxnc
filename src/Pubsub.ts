import { asyncIterableIterator } from "./.internal/asyncIterableIterator";
import { ejectedPromise } from "./ejectedPromise";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple";
import { lock } from "./lock";

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

		let [processingPromise, processingResolve] = lock();
		let p = ejectedPromise<Value>();

		const iterator = asyncIterableIterator({
			next: async () => {
				processingResolve();

				const result = await p.promise;
				[processingPromise, processingResolve] = lock();
				return result;
			},
		});

		const dispatch = async (value: IteratorResult<T>) => {
			await processingPromise;
			p.resolve(value);
			p = ejectedPromise<Value>();
		};

		const reject = async (e: unknown) => {
			await processingPromise;
			reject(e);
			p = ejectedPromise<Value>();
		};

		return labeledTuple([iterator, dispatch, reject], {
			iterator,
			dispatch,
			reject,
		});
	},
};
