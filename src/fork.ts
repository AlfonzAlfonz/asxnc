interface Fork {
	<T>(fn: () => T): Promise<T>;

	<const T extends (Promise<unknown> | (() => Promise<unknown>))[]>(
		fns: T,
	): Promise<{
		-readonly [P in keyof T]: T[P] extends () => any
			? Awaited<ReturnType<T[P]>>
			: Awaited<T[P]>;
	}>;
}

/**
 * The `fork()` function takes an array of promises or functions which return a
 * promise and returns a single promise which executes all functions and awaits
 * all promises. Similar to `Promise.all()` but executes functions in the input
 * array.
 *
 * @category Utilities
 *
 * @example
 * const result = fork([
 *   async () => {
 *     await wait(1000);
 *     return "hello";
 *   },
 *   wait(500).then(() => "world")
 * ]);
 * console.log(result); // ["hello", "world"]
 */
export const fork: Fork = (
	fns: (() => any) | (Promise<unknown> | (() => Promise<unknown>))[],
): Promise<any> =>
	typeof fns === "function"
		? fns()
		: (Promise.all(
				fns.map((fn) => (typeof fn === "function" ? fn() : fn)),
			) as any);
