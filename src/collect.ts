import { toAsyncIterable } from "./.internal/toAsyncIterable";

/**
 * The `collect()` function takes an async iterable or async iterator, iterates
 * it and return an array of all yielded values.
 *
 * @category Utilities
 *
 * @example
 * async function numbers() {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * }
 *
 * console.log(await collect(numbers())); // [1, 2, 3]
 */
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
