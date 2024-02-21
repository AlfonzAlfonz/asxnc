import { asyncIterableIterator } from "../utils/asyncIterableIterator";
import { ejectedPromise } from "../synchronization/ejectedPromise";
import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";

export type Queue<T> = LabeledTuple<
	readonly [
		iterator: AsyncIterableIterator<T> & {
			shiftSync: () => IteratorResult<T> | undefined;
		},
		dispatch: (value: IteratorResult<T>) => void,
		reject: (e: unknown) => void,
	],
	readonly ["iterator", "dispatch", "reject"]
>;

/**
 * queue implements 1 reader N non-blocked writers channel.
 * Exposes a iterator for retrieving yielded values and a dispatch function
 * which pushes value to the queue without waiting for its consumtion.
 */
export const queue = <T>(): Queue<T> => {
	let lock = ejectedPromise<void>();
	const queue: IteratorResult<T>[] = [];

	return labeledTuple(
		[
			// iterator
			asyncIterableIterator({
				next: async () => {
					while (true) {
						if (queue.length === 0) {
							await lock.promise;
							lock = ejectedPromise<void>();
						} else {
							break;
						}
					}

					return queue.shift()!;
				},
				shiftSync: () => {
					if (queue.length === 0) return undefined;
					else return queue.shift();
				},
			}),
			// dispatch
			(v) => {
				queue.push(v);
				lock.resolve();
			},
			// reject
			lock.reject,
		] as const,
		["iterator", "dispatch", "reject"],
	);
};
