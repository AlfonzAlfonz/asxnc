import { instant } from "./instant";

test("instant", async () => {
	let str = "a";
	const p = instant().then(() => (str += "c"));
	str += "b";

	await p;

	expect(str).toBe("abc");
});
