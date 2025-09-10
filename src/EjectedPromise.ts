import { LabeledTuple, labeledTuple } from "./.internal/labeledTuple.js";

export type EjectedPromise<T> = LabeledTuple<
	[
		promise: Promise<T>,
		resolve: (v: T | PromiseLike<T>) => void,
		reject: (reason?: any) => void,
	],
	{
		promise: Promise<T>;
		resolve: (v: T | PromiseLike<T>) => void;
		reject: (reason?: any) => void;
	}
>;

/**
 * The `EjectedPromise.create()` function returns a promise and a function to resolve
 * and another one to reject it. Similar to `Promise.withResolvers()` but it
 * supports destructuring by either array destructuring or object destructuring.
 *
 * @example
 * const { promise, resolve, reject } = EjectedPromise.create();
 * const [promise2, resolve2, reject2] = EjectedPromise.create();
 */
export const EjectedPromise = {
	create: <T>(): EjectedPromise<T> => {
		let resolve: EjectedPromise<T>[1];
		let reject: EjectedPromise<T>[2];
		const promise = new Promise<T>((re, rj) => {
			resolve = re;
			reject = rj;
		});

		return labeledTuple(
			// @ts-expect-error
			[promise, resolve, reject],
			// @ts-expect-error
			{ promise, resolve, reject },
		);
	},
};
