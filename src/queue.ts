import { asyncIterableIterator } from "./utils/asyncIterableIterator";
import { ejectedPromise } from "./ejectedPromise";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";

export type Queue<T, TReturn = unknown> = LabeledTuple<
	readonly [
		iterator: AsyncIterableIterator<T>,
		dispatch: (value: IteratorResult<T, TReturn>) => void,
		reject: (e: unknown) => void,
	],
	readonly ["iterator", "dispatch", "reject"]
>;

/**
 * queue implements 1 reader N non-blocked writers channel.
 * Exposes a iterator for retrieving yielded values and a dispatch function
 * which pushes value to the queue without waiting for its consumtion.
 */
export const queue = <T, TReturn = unknown>(): Queue<T, TReturn> => {
	let [queueUpdated, resolveQueueUpdate, reject] = ejectedPromise<void>();
	const queue: IteratorResult<T, TReturn>[] = [];

	return labeledTuple(
		[
			// iterator
			asyncIterableIterator({
				next: async () => {
					while (true) {
						if (queue.length === 0) {
							await queueUpdated;
							[queueUpdated, resolveQueueUpdate] = ejectedPromise<void>();
						} else {
							break;
						}
					}

					const s = queue.shift()!;
					return s;
				},
			}),
			// dispatch
			(v) => {
				queue.push(v);
				resolveQueueUpdate();
			},
			// reject
			reject,
		] as const,
		["iterator", "dispatch", "reject"],
	);
};
