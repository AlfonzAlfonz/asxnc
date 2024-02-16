import { collect } from "./collect";
import { pubsub } from "./pubsub";

test("pubsub - iterator first", async () => {
	const [iterator, dispatch] = pubsub<number>();

	const [result] = await Promise.all([
		collect(iterator),
		(async () => {
			await dispatch({ done: false, value: 1 });
			await dispatch({ done: false, value: 2 });
			await dispatch({ done: false, value: 3 });
			await dispatch({ done: true, value: undefined });
		})(),
	]);

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);

test("pubsub - dispatch first", async () => {
	const [iterator, dispatch] = pubsub<number>();

	const [, result] = await Promise.all([
		(async () => {
			await dispatch({ done: false, value: 1 });
			await dispatch({ done: false, value: 2 });
			await dispatch({ done: false, value: 3 });
			await dispatch({ done: true, value: undefined });
		})(),
		collect(iterator),
	]);

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);
