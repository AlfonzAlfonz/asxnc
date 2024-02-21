export const wait = (duration: number, unit: "ms" | "s" | "m" = "ms") =>
	new Promise<void>((resolve) => {
		setTimeout(resolve, duration * units[unit]);
	});

export const units = {
	ms: 1,
	s: 1000,
	m: 60 * 1000,
};
