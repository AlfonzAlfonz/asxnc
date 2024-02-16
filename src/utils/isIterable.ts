export const isIterable = (x: unknown): x is Iterable<unknown> =>
	!!x &&
	typeof x === "object" &&
	Symbol.asyncIterator in x &&
	typeof x[Symbol.asyncIterator] === "function";
