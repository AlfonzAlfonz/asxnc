export const toAsyncIterable = <T>(
	collection: AsyncIterable<T> | AsyncIterator<T>,
) =>
	Symbol.asyncIterator in collection
		? collection
		: { [Symbol.asyncIterator]: () => collection };
