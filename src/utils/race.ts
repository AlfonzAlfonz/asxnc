import { Awaitable } from "./types";

export const race = <TReturn>(
	...fns: (Awaitable<TReturn> | (() => Awaitable<TReturn>))[]
): Promise<TReturn> =>
	Promise.race(
		fns.map((fn) => (typeof fn === "function" ? (fn as any)() : fn)),
	);
