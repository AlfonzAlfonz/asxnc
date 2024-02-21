import { ejectedPromise } from "./ejectedPromise";
import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";

export type Lock = LabeledTuple<
	readonly [handle: Promise<void>, resolve: () => void],
	readonly ["handle", "release"]
>;

export const lock = (): Lock => {
	const [promise, resolve] = ejectedPromise<void>();
	return labeledTuple([promise, resolve], ["handle", "release"]);
};
