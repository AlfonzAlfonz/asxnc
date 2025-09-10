import { asyncIterableIterator } from "./.internal/asyncIterableIterator.js";
import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";
import { iteratorResult, IteratorResultTuple } from "./.internal/utils.js";
import { EjectedPromise } from "./EjectedPromise.js";

export type Queue<T> = LabeledTuple<
	[
		iterator: AsyncIterableIterator<T> & {
			shiftSync: () => IteratorResult<T> | undefined;
		},
		dispatch: (...args: IteratorResultTuple<T, undefined>) => void,
		reject: (e: unknown) => void,
	],
	{
		iterator: AsyncIterableIterator<T> & {
			shiftSync: () => IteratorResult<T> | undefined;
		};
		dispatch: (...args: IteratorResultTuple<T, undefined>) => void;
		reject: (e: unknown) => void;
	}
>;

/**
 * Queue is a 1-reader N-writers data structure, which allows multiple producers
 * to dispatch data and a single consumer to consume them. All dispatched values
 * are stored and can be read only once.
 *
 * @example
 * const queue = Queue.create();
 *
 * fork([
 *   async () => {
 *     const result = []
 *     for (const value of queue.iterator) {
 *       result.push(value);
 *     }
 *     console.log(result); // [1, 2, 3]
 *   }
 *   async () => {
 *     queue.dispatch(1);
 *     queue.dispatch(2);
 *     queue.dispatch(3);
 *   }
 * ]);
 */
export const Queue = {
	create: <T>(): Queue<T> => {
		let lock = EjectedPromise.create<void>();
		const queue: IteratorResult<T>[] = [];
		let closed = false;

		const iterator = asyncIterableIterator({
			next: async () => {
				while (true) {
					if (queue.length === 0) {
						await lock.promise;
						lock = EjectedPromise.create<void>();
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
		});

		const dispatch = (...args: IteratorResultTuple<T, undefined>) => {
			if (closed) {
				throw new Error(`Dispatch new values to closed Queue is not possible.`);
			}
			if (args[1] === true) {
				closed = true;
			}

			queue.push(iteratorResult(args));
			lock.resolve();
		};

		const reject = lock.reject;

		return labeledTuple([iterator, dispatch, reject], {
			iterator,
			dispatch,
			reject,
		});
	},
};
