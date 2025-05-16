import { Prettify } from "./types.js";

export const asyncIterableIterator = <
	TObj extends {
		next: () => Promise<IteratorResult<unknown, unknown>>;
	},
>(
	iterator: TObj,
): ExtendedAsyncIterableIterator<TObj> =>
	({
		...iterator,
		[Symbol.asyncIterator]: function () {
			return this;
		},
	}) as any;

type ExtendedAsyncIterableIterator<
	TIterator extends {
		next: () => Promise<IteratorResult<unknown, unknown>>;
	},
> = Prettify<
	TIterator & {
		[Symbol.asyncIterator]: () => ExtendedAsyncIterableIterator<TIterator>;
		event: <K extends EventKey<IterableT<TIterator>>>(
			key: K,
		) => AsyncIterableIterator<Prettify<[K, unknown] & IterableT<TIterator>>>;
	}
>;

type IterableT<
	TIterable extends {
		next: () => Promise<IteratorResult<unknown, unknown>>;
	},
> =
	Awaited<ReturnType<TIterable["next"]>> extends IteratorResult<infer U>
		? U
		: never;

type EventKey<T> = T extends [string, unknown]
	? T extends [infer Key, unknown]
		? Key
		: never
	: never;
