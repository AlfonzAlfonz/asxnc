export type LabeledTuple<
	T extends readonly any[],
	N extends Record<keyof TupleToObject<T>, PropertyKey>,
> = T & { [K in keyof TupleToObject<T> as N[K]]: T[K] };

export const labeledTuple = <
	const T extends readonly unknown[],
	const TProperties extends Record<keyof TupleToObject<T>, PropertyKey>,
>(
	tuple: T,
	labels: TProperties,
): LabeledTuple<T, TProperties> => {
	for (let i = 0; i < (labels as any).length; i++) {
		(tuple as any)[(labels as any)[i]!] = tuple[i];
	}

	return tuple as any;
};

type TupleToObject<T extends readonly any[]> = {
	[K in keyof T as Exclude<K, keyof any[]>]: T[K];
};
