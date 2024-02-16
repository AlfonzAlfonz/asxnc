export type LabeledTuple<
	T extends readonly unknown[],
	TProperties extends readonly string[],
> = T & {
	[K in keyof TProperties as TProperties[K & number]]: K extends keyof T
		? T[K]
		: never;
};

export const labeledTuple = <
	const T extends readonly unknown[],
	const TProperties extends readonly string[],
>(
	tuple: T,
	labels: TProperties,
): LabeledTuple<T, TProperties> => {
	for (let i = 0; i < labels.length; i++) {
		(tuple as any)[labels[i]!] = tuple[i];
	}

	return tuple as any;
};
