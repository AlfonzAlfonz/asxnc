import { asyncIterableIterator } from "./.internal/asyncIterableIterator";
import { lineup } from "./.internal/lineup";
import { toAsyncIterator } from "./.internal/toAsyncIterator";
import { AsyncIterableish, AsyncIterableishValue } from "./.internal/types";
import { Queue } from "./Queue";

/**
 * @category Transformers
 */
export const Mux = {
	join: <T extends Record<string, AsyncIterableish<unknown>>>(iterables: T) => {
		let currentPollIterator:
			| AsyncIterableIterator<ObjEntries<MuxToDictionary<T>> | undefined>
			| undefined = undefined;
		const length = Object.keys(iterables).length;
		let finishedIteratorCounter = 0;

		const iterators = Object.fromEntries(
			Object.entries(iterables).map(([k, it]) => [k, toAsyncIterator(it)]),
		);

		const iterator = asyncIterableIterator({
			next: async () => {
				while (true) {
					if (currentPollIterator) {
						const result = await currentPollIterator.next();
						if (result.done) {
							currentPollIterator = undefined;
						} else {
							if (result.value === undefined) {
								finishedIteratorCounter++;
								if (finishedIteratorCounter === length) {
									return { value: undefined, done: true };
								} else {
									continue;
								}
							}
							return result;
						}
					}

					currentPollIterator = lineup(
						Object.entries(iterators).map(([k, it]) =>
							it.next().then((v) => {
								if (v.done) {
									return undefined;
								}
								return [
									k,
									v.value as MuxToDictionary<T>[keyof MuxToDictionary<T>],
								];
							}),
						),
					);
				}
			},
		});

		return iterator;
	},
	split: <TKeys extends string, T extends [TKeys, unknown]>(
		types: TKeys[],
		iterable: AsyncIterableish<T>,
	) => {
		const iterator = toAsyncIterator(iterable);

		const typePromiseMap = Object.fromEntries(
			types.map((t) => [t, Queue.create()]),
		);

		const result = Object.fromEntries(
			types.map((t) => [
				t,
				asyncIterableIterator({
					next: async () => {
						while (true) {
							const queue = typePromiseMap[t]!.iterator;

							const sync = queue.shiftSync();
							if (sync) {
								return sync;
							}

							const polledValue = await iterator.next();

							if (polledValue.done || polledValue.value[0] === t) {
								return polledValue;
							}

							const targetQueue = typePromiseMap[polledValue.value[0]];

							if (!targetQueue) {
								console.warn(
									new Error(
										`Unexpected value of type ${polledValue.value[0]} in Mux.split iterator, discarding`,
									),
								);
							} else {
								targetQueue.dispatch(polledValue);
							}
						}
					},
				}),
			]),
		);

		return result as any as {
			[K in TKeys]: AsyncIterableIterator<
				PrettifyIntersection<[K, unknown] & T>
			>;
		};
	},
};

type MuxToDictionary<T extends Record<string, AsyncIterableish<unknown>>> = {
	[K in keyof T]: AsyncIterableishValue<T[K]>;
};

type ObjEntries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

type PrettifyIntersection<T> = T extends [infer X, infer Y] ? [X, Y] : never;
