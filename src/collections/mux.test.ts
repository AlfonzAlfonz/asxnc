import { wait } from "../scheduling/wait";
import { fork } from "../utils/fork";
import { toAsyncIterable } from "../utils/toAsyncIterable";
import { multiplex } from "./multiplex";
import { mux } from "./mux";
import { Queue, queue } from "./queue";

test("example", async () => {
	const open = queue<number>();
	const close = queue<number>();

	const iterator = mux({
		open: open.iterator,
		close: close.iterator,
	});

	const result: Record<string, number> = {};

	await fork(
		async () => {
			for await (const e of toAsyncIterable(iterator)) {
				result[e[0]] ??= 0;
				result[e[0]] += 1;
			}
		},
		async () => {
			open.dispatch({ value: 0 });
			open.dispatch({ value: 1 });
			close.dispatch({ value: 0 });
			open.dispatch({ value: 2 });
			close.dispatch({ value: 1 });

			open.dispatch({ done: true, value: undefined });
			close.dispatch({ done: true, value: undefined });
		},
	);

	expect(result.open).toBe(3);
	expect(result.close).toBe(2);
});

test("example 2", async () => {
	const open = multiplex(queue<number>());
	const close = multiplex(queue<number>());

	const [iterator, dispatch] = mux({
		open,
		close,
	});

	let openCount = 0;
	let closeCount = 0;

	await fork(
		async () => {
			for await (const e of open.iterable) {
				openCount++;
			}
		},
		async () => {
			for await (const e of close.iterable) {
				closeCount++;
			}
		},
		async () => {
			wait(100);
			dispatch({ value: ["open", 0] });
			dispatch({ value: ["open", 1] });
			dispatch({ value: ["close", 0] });
			dispatch({ value: ["open", 2] });
			dispatch({ value: ["close", 1] });

			dispatch({ done: true, value: undefined });
		},
	);

	expect(openCount).toBe(3);
	expect(closeCount).toBe(2);
});
