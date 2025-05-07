import { labeledTuple } from "./labeledTuple";

test("labeledTuple", () => {
	const lt = labeledTuple([1, 2, 3], {
		a: 1,
		b: 2,
		c: 3,
	});

	{
		const [a, b, c] = lt;
		expect([a, b, c]).toEqual([1, 2, 3]);
	}
	{
		const { a, b, c } = lt;
		expect([a, b, c]).toEqual([1, 2, 3]);
	}
});
