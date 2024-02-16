export const isIterator = (x: unknown): x is Iterator<unknown> =>
	!!x && typeof x === "object" && "next" in x && typeof x.next === "function";
