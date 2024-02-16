import { fork } from "./fork";
import { multiplex } from "./multiplex";
import { pubsub } from "./pubsub";

test("multiplex", async () => {
	const [iterable, dispatch] = multiplex(pubsub());

	let count = 0;

	await fork(
		async () => {
			for await (const v of iterable) {
				count++;
			}
		},
		async () => {
			for await (const v of iterable) {
				count++;
			}
		},
		async () => {
			await dispatch({ value: 1, done: false });
			await dispatch({ value: undefined, done: true });
		},
	);

	expect(count).toBe(2);
});
