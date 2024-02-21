export type Prettify<T> = {
	[K in keyof T]: T[K];
};

export type Awaitable<T> = T | PromiseLike<T>;
