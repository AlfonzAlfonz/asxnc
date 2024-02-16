import { asyncIterableIterator } from "./utils/asyncIterableIterator";
import { ejectedPromise } from "./ejectedPromise";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";
import { lock } from "./lock";

export type PubSub<T, TReturn = unknown> = LabeledTuple<
	readonly [
		iterator: AsyncIterableIterator<T>,
		dispatch: (value: IteratorResult<T, TReturn>) => Promise<void>,
		reject: (value: unknown) => Promise<void>,
	],
	readonly ["iterator", "dispatch", "reject"]
>;

/**
 * pubsub implements 1 reader 1 writer channel. Exposes a iterator for
 * retrieving values and a dispatch function which sends value to the iterator and
 * returns promise which resolves after the value is consumed.
 */
export const pubsub = <T, TReturn = unknown>(): PubSub<T, TReturn> => {
	type Value = IteratorResult<T, TReturn>;

	let [processingPromise, processingResolve] = lock();
	let [promise, resolve, reject] = ejectedPromise<Value>();

	return labeledTuple(
		[
			// iterator
			asyncIterableIterator({
				next: async () => {
					processingResolve();

					const result = await promise;
					[processingPromise, processingResolve] = lock();
					return result;
				},
			}),
			// dispatch
			async (value) => {
				await processingPromise;
				resolve(value);
				[promise, resolve] = ejectedPromise<Value>();
			},
			// reject
			async (e) => {
				await processingPromise;
				reject(e);
				[promise, resolve] = ejectedPromise<Value>();
			},
		] as const,
		["iterator", "dispatch", "reject"],
	);
};
