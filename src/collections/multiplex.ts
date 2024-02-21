import { Queue, queue } from "./queue";
import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";
import { toAsyncIterator } from "../utils/toAsyncIterator";

export interface MultiplexFunction {
	<T>(collection: AsyncIterable<T> | AsyncIterator<T>): AsyncIterable<T>;

	<
		TCollection extends readonly [
			AsyncIterable<unknown> | AsyncIterator<unknown>,
			(v: IteratorResult<never>) => unknown,
			(e: unknown) => void,
		],
	>(
		collection: TCollection,
	): Multiplexed<TCollection>;
}

export type Multiplexed<
	TCollection extends readonly [
		AsyncIterable<unknown> | AsyncIterator<unknown>,
		(v: IteratorResult<never>) => unknown,
		(e: unknown) => void,
	],
> = LabeledTuple<
	readonly [
		TCollection[0] extends AsyncIterable<infer T> | AsyncIterator<infer T>
			? AsyncIterable<T>
			: never,
		TCollection[1],
		TCollection[2],
	],
	readonly ["iterable", "dispatch", "reject"]
>;

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
