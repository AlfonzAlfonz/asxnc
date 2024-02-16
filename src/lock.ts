import { ejectedPromise } from "./ejectedPromise";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";

export type Lock = LabeledTuple<
	readonly [lock: Promise<void>, resolve: () => void],
	readonly ["lock", "release"]
>;

export const lock = (): Lock => {
	const [promise, resolve] = ejectedPromise<void>();
	return labeledTuple([promise, resolve], ["lock", "release"]);
};
