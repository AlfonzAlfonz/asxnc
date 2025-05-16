import { Queue } from "./Queue.js";
import { fork } from "./fork.js";
import { instant } from "./.internal/instant.js";
import { collect } from "./collect.js";

test("Queue", async () => {
	const [iterator, dispatch] = Queue.create<number>();

	const generate1To3 = async () => {
		dispatch({ done: false, value: 1 });
		await instant();

		dispatch({ done: false, value: 2 });
		await instant();

		dispatch({ done: false, value: 3 });
		await instant();
	};

	const generate4To6 = async () => {
		dispatch({ done: false, value: 4 });
		await instant();

		dispatch({ done: false, value: 5 });
		await instant();

		dispatch({ done: false, value: 6 });
		await instant();
	};

	const [result] = await Promise.all([
		collect(iterator),
		Promise.all([generate1To3(), generate4To6()]).then(() =>
			dispatch({ done: true, value: undefined }),
		),
	]);

	expect(result.length).toBe(6);
}, 1000);

test("Queue - reject", async () => {
	const [iterator, , reject] = Queue.create();

	let error = null;
	await fork([
		async () => {
			try {
				for await (const _ of iterator) {
					// noop
				}
			} catch (e) {
				error = e;
			}
		},
		async () => {
			reject(new Error());
		},
	]);
	expect(error).toBeInstanceOf(Error);
});

test("Queue - no wait", async () => {
	const [iterator, dispatch] = Queue.create<number>();

	const generate1To3 = async () => {
		dispatch({ done: false, value: 1 });
		dispatch({ done: false, value: 2 });
		dispatch({ done: false, value: 3 });
	};

	const generate4To6 = async () => {
		dispatch({ done: false, value: 4 });
		dispatch({ done: false, value: 5 });
		dispatch({ done: false, value: 6 });
		dispatch({ done: true, value: undefined });
	};

	const [result] = await fork([
		collect(iterator),
		async () => {
			generate1To3();
			generate4To6();
		},
	]);

	expect(result.length).toBe(6);
}, 1000);
