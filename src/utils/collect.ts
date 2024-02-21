import { toAsyncIterable } from "./toAsyncIterable";

export const collect = async <T>(
	collection: AsyncIterator<T> | AsyncIterable<T>,
) => {
	const iterable = toAsyncIterable(collection);

	const result = [];

	for await (const val of iterable) {
		result.push(val);
	}
	return result;
};
