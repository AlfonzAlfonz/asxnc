import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";

export type EjectedPromise<T> = LabeledTuple<
	readonly [
		promise: Promise<T>,
		resolve: (v: T | PromiseLike<T>) => void,
		reject: (reason?: any) => void,
	],
	readonly ["promise", "resolve", "reject"]
>;

export const ejectedPromise = <T>(): EjectedPromise<T> => {
	let resolve: EjectedPromise<T>[1];
	let reject: EjectedPromise<T>[2];
	const promise = new Promise<T>((re, rj) => {
		resolve = re;
		reject = rj;
	});

	return labeledTuple(
		// @ts-expect-error
		[promise, resolve, reject],
		["promise", "resolve", "reject"],
	);
};
