import { Queue } from "./Queue.js";
import { fork } from "./fork.js";
import { instant } from "./.internal/instant.js";
import { collect } from "./collect.js";
import { jest } from "@jest/globals";
import { wait } from "./wait.js";

describe("Queue", () => {
	test("resolve", async () => {
		jest.useRealTimers();

		const [iterator, dispatch] = Queue.create<number>();

		const generate1To3 = async () => {
			dispatch(1);
			await instant();

			dispatch(2);
			await instant();

			dispatch(3);
			await instant();
		};

		const generate4To6 = async () => {
			dispatch(4);
			await instant();

			dispatch(5);
			await instant();

			dispatch(6);
			await instant();
		};

		const [result] = await Promise.all([
			collect(iterator),
			Promise.all([generate1To3(), generate4To6()]).then(() =>
				dispatch(undefined, true),
			),
		]);

		expect(result.length).toBe(6);
	}, 1000);

	test("reject", async () => {
		jest.useRealTimers();

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

	test("no wait", async () => {
		jest.useRealTimers();

		const [iterator, dispatch] = Queue.create<number>();

		const generate1To3 = async () => {
			dispatch(1);
			dispatch(2);
			dispatch(3);
		};

		const generate4To6 = async () => {
			dispatch(4);
			dispatch(5);
			dispatch(6);
			dispatch(undefined, true);
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

	test("idk", async () => {
		jest.useFakeTimers();

		const result: number[] = [];

		const [iterator, dispatch] = Queue.create<number>();

		const p = fork(async () => {
			for await (const v of iterator) {
				result.push(v);
			}
		});

		await jest.advanceTimersByTimeAsync(1000);

		dispatch(0);
		dispatch(1);
		dispatch(2);
		dispatch(3);
		dispatch(4);
		dispatch(undefined, true);

		await p;

		expect(result).toEqual([0, 1, 2, 3, 4]);
	});
});
