export type Prettify<T> = {
	[K in keyof T]: T[K];
};

export type Awaitable<T> = T | PromiseLike<T>;

export type AsyncIterableish<T> = AsyncIterable<T> | AsyncIterator<T>;

export type AsyncIterableishValue<T extends AsyncIterableish<unknown>> =
	T extends AsyncIterableish<infer U> ? U : never;
