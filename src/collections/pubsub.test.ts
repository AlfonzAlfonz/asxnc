import { collect } from "../utils/collect";
import { fork } from "../utils/fork";
import { pubsub } from "./pubsub";

test("example", async () => {
	const [iterator, dispatch] = pubsub<number>();

	const app = async () => {
		const result = [];
		for await (const v of iterator) {
			result.push(v);
		}
		return result;
	};

	const oneToThree = async () => {
		// every dispatch call needs to be awaited
		await dispatch({ done: false, value: 1 });
		await dispatch({ done: false, value: 2 });
		await dispatch({ done: false, value: 3 });
		await dispatch({ done: true, value: undefined });
	};

	const [result] = await fork(app, oneToThree);

	expect(result).toMatchObject([1, 2, 3]);
});

test("pubsub - iterator first", async () => {
	const [iterator, dispatch] = pubsub<number>();

	const [result] = await fork(collect(iterator), async () => {
		await dispatch({ done: false, value: 1 });
		await dispatch({ done: false, value: 2 });
		await dispatch({ done: false, value: 3 });
		await dispatch({ done: true, value: undefined });
	});

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);

test("pubsub - dispatch first", async () => {
	const [iterator, dispatch] = pubsub<number>();

	const [, result] = await fork(async () => {
		await dispatch({ done: false, value: 1 });
		await dispatch({ done: false, value: 2 });
		await dispatch({ done: false, value: 3 });
		await dispatch({ done: true, value: undefined });
	}, collect(iterator));

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);
