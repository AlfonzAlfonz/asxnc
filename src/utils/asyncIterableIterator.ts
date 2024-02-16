import { Prettify } from "./types";

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

type ExtendedAsyncIterableIterator<TObj> = Prettify<
	TObj & { [Symbol.asyncIterator]: () => ExtendedAsyncIterableIterator<TObj> }
>;
