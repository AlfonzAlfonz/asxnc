import { Queue } from "../Queue.js";

export const lineup = <T>(promises: Promise<T>[]) => {
	const { iterator, dispatch, reject } = Queue.create<T>();
	let counter = 0;

	promises.map((p) =>
		p.then(
			(v) => {
				dispatch({ value: v, done: false });
				counter++;
				if (counter === promises.length) {
					dispatch({ value: undefined, done: true });
				}
			},
			(e) => reject(e),
		),
	);

	return iterator;
};
