/**
 * The `wait()` function returns a promise which is resolved after a set
 * duration.
 */
export const wait = (
	duration: number,
	unit: keyof typeof units = "ms",
	signal?: AbortSignal,
) =>
	new Promise<void>((resolve) => {
		const id = setTimeout(resolve, duration * units[unit]);
		signal?.addEventListener("abort", () => clearTimeout(id));
	});

export const units = {
	ms: 1,
	s: 1000,
	m: 60 * 1000,
	h: 60 * 60 * 1000,
	d: 24 * 60 * 60 * 1000,
};
