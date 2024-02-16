export const fork = <T extends (() => Promise<unknown>)[]>(
	...fns: T
): Promise<{ -readonly [P in keyof T]: Awaited<ReturnType<T[P]>> }> =>
	Promise.all(fns.map((fn) => fn())) as any;
