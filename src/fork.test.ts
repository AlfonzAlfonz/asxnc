import { fork } from "./fork.js";

test("fork", async () => {
	const result = await fork([async () => "hello", Promise.resolve("world")]);

	expect(result).toEqual(["hello", "world"]);
});
