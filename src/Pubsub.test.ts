import { collect } from "./collect.js";
import { fork } from "./fork.js";
import { Pubsub } from "./Pubsub.js";

test("Pubsub", async () => {
	const [iterator, dispatch] = Pubsub.create<number>();

	const app = async () => {
		const result = [];
		for await (const v of iterator) {
			result.push(v);
		}
		return result;
	};

	const oneToThree = async () => {
		// every dispatch call needs to be awaited
		await dispatch(1, false);
		await dispatch(2, false);
		await dispatch(3, false);
		await dispatch(undefined, true);
	};

	const [result] = await fork([app, oneToThree]);

	expect(result).toMatchObject([1, 2, 3]);
});

test("Pubsub - iterator first", async () => {
	const [iterator, dispatch] = Pubsub.create<number>();

	const [result] = await fork([
		collect(iterator),
		async () => {
			await dispatch(1, false);
			await dispatch(2, false);
			await dispatch(3, false);
			await dispatch(undefined, true);
		},
	]);

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);

test("Pubsub - dispatch first", async () => {
	const [iterator, dispatch] = Pubsub.create<number>();

	const [, result] = await fork([
		async () => {
			await dispatch(1, false);
			await dispatch(2, false);
			await dispatch(3, false);
			await dispatch(undefined, true);
		},
		collect(iterator),
	]);

	expect(result).toMatchObject([1, 2, 3]);
}, 1000);
