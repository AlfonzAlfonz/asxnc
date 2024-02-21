export const fork = <T extends (Promise<unknown> | (() => Promise<unknown>))[]>(
	...fns: T
): Promise<{
	-readonly [P in keyof T]: T[P] extends () => any
		? Awaited<ReturnType<T[P]>>
		: Awaited<T[P]>;
}> =>
	Promise.all(fns.map((fn) => (typeof fn === "function" ? fn() : fn))) as any;
