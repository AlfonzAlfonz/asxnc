export type IteratorResultTuple<TYield, TReturn> =
	| [value: TYield, done?: false]
	| [value: TReturn, done: true];

export const iteratorResult = <TYield, TReturn>(
	args: IteratorResultTuple<TYield, TReturn>,
) =>
	({ value: args[0], done: args[1] ?? false }) as IteratorResult<
		TYield,
		TReturn
	>;
