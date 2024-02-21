import { queue } from "./queue";
import { fork } from "../utils/fork";
import { instant } from "../scheduling/instant";
import { collect } from "../utils/collect";

test("queue", async () => {
	const [iterator, dispatch] = queue<number>();

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

test("queue - reject", async () => {
	const [iterator, , reject] = queue();

	let error = null;
	await fork(
		async () => {
			try {
				for await (const x of iterator) {
				}
			} catch (e) {
				error = e;
			}
		},
		async () => {
			reject(new Error());
		},
	);
	expect(error).toBeInstanceOf(Error);
});

test("no wait", async () => {
	const [iterator, dispatch] = queue<number>();

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

	const [result] = await fork(collect(iterator), async () => {
		generate1To3();
		generate4To6();
	});

	expect(result.length).toBe(6);
}, 1000);
