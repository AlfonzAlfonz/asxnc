import { fork, queue } from "..";
import { toAsyncIterator } from "../utils/toAsyncIterator";

export interface MuxFunction {
	<T extends Record<string, AsyncIterable<unknown> | AsyncIterator<unknown>>>(
		iterables: T,
	): AsyncIterator<MuxEntries<T>>;

	<
		T extends Record<
			string,
			readonly [
				AsyncIterable<unknown> | AsyncIterator<unknown>,
				(value: IteratorResult<never>) => void,
				unknown,
			]
		>,
	>(
		iterables: T,
	): [
		AsyncIterator<MuxEntries<T>>,
		(value: IteratorResult<MuxEntries<T>>) => void,
	];
}

export const mux: MuxFunction = (collection: any): any => {
	const keys = Object.keys(collection);

	if (!keys[0]) {
		throw new Error("Mux requires at least 1 iterator");
	}

	if (Array.isArray(collection[keys[0]])) {
		const iterables = Object.fromEntries(
			keys.map((k) => [k, collection[k][0]]),
		);

		return [_mux(iterables), _muxDispatch(collection, keys)];
	} else {
		return _mux(collection);
	}
};

const _mux = <
	T extends Record<string, AsyncIterable<unknown> | AsyncIterator<unknown>>,
>(
	iterables: T,
): AsyncIterator<MuxEntries<T>> => {
	const q = queue<MuxEntries<T>>();

	fork(
		...Object.entries(iterables).map(async ([key, i]) => {
			const iterable = toAsyncIterator(i);
			while (true) {
				const result = await iterable.next().catch((e) => q.reject(e));

				if (!result) continue;
				if (result.done) break;

				q.dispatch({ value: [key, result.value] as MuxEntries<T> });
			}
		}),
	).then(() => {
		q.dispatch({ done: true, value: undefined });
	});

	return q[0];
};

export type MuxEntries<T> = {
	[K in keyof T]: [
		K,
		T[K] extends AsyncIterable<infer TValue> | AsyncIterator<infer TValue>
			? TValue
			: T[K] extends readonly [
						AsyncIterable<infer TValue> | AsyncIterator<infer TValue>,
						...unknown[],
				  ]
				? TValue
				: never,
	];
}[keyof T];

const _muxDispatch = <
	TValue,
	T extends Record<
		string,
		readonly [
			AsyncIterable<TValue> | AsyncIterator<TValue>,
			(value: IteratorResult<TValue>) => void,
			unknown,
		]
	>,
>(
	collection: T,
	keys: (keyof T)[],
) => {
	return (result: IteratorResult<MuxEntries<T>>) => {
		if (result.done) {
			for (const k of keys) {
				collection[k]![1](result);
			}
		} else {
			const [key, value] = result.value;
			collection[key]![1]({ value: value as TValue, done: false });
		}
	};
};
