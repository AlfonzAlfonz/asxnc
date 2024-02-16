import { queue } from "./queue";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";
import { toAsyncIterator } from "./utils/toAsyncIterator";

export interface MultiplexFunction {
	<T>(collection: AsyncIterable<T> | AsyncIterator<T>): AsyncIterable<T>;

	<T, TDispatch extends (v: IteratorResult<T>) => unknown>(
		collection: readonly [
			AsyncIterable<T> | AsyncIterator<T>,
			TDispatch,
			(e: unknown) => void,
		],
	): LabeledTuple<
		readonly [AsyncIterable<T>, TDispatch],
		readonly ["iterable", "dispatch"]
	>;
}

export const multiplex: MultiplexFunction = (collection: any): any => {
	if (Array.isArray(collection)) {
		return labeledTuple(
			[_multiplex(collection[0]), collection[1]],
			["iterable", "dispatch"],
		);
	} else {
		return _multiplex(collection);
	}
};

const _multiplex = <T>(
	collection: AsyncIterable<T> | AsyncIterator<T>,
): AsyncIterable<T> => {
	const iterator = toAsyncIterator(collection);
	const subscribers: [
		(value: IteratorResult<T, unknown>) => void,
		(e: unknown) => void,
	][] = [];

	(async () => {
		while (true) {
			const result = await iterator.next().catch((e) => {
				for (const subscriber of subscribers) {
					subscriber[1](e);
				}
			});

			if (result) {
				for (const subscriber of subscribers) {
					subscriber[0](result);
				}
			}
		}
	})();

	return {
		[Symbol.asyncIterator]: () => {
			const [iterator, dispatch, reject] = queue<T>();
			subscribers.push([dispatch, reject]);

			return iterator;
		},
	};
};
