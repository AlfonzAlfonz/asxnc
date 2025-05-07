export type LabeledTuple<
	TArray extends unknown[],
	TObject extends object,
> = TObject & TArray;

export const labeledTuple = <
	const TArray extends unknown[],
	const TObject extends object,
>(
	array: TArray,
	object: TObject,
): LabeledTuple<TArray, TObject> => {
	Object.assign(array, object);
	return array as LabeledTuple<TArray, TObject>;
};
