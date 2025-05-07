import { fork } from "./fork";

test("fork", async () => {
	const result = await fork([async () => "hello", Promise.resolve("world")]);

	expect(result).toEqual(["hello", "world"]);
});
