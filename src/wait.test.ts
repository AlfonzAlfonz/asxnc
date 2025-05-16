import { wait } from "./wait.js";
import { jest } from "@jest/globals";

test("wait", async () => {
	jest.useFakeTimers();

	let triggered = false;
	wait(100, "ms").then(() => {
		triggered = true;
	});

	await jest.advanceTimersByTimeAsync(100);
	expect(triggered).toBe(true);
});
