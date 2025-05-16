import { Queue } from "../Queue.js";

export const lineup = <T>(promises: Promise<T>[]) => {
	const { iterator, dispatch, reject } = Queue.create<T>();
	let counter = 0;

	promises.map((p) =>
		p.then(
			(v) => {
				dispatch(v, false);
				counter++;
				if (counter === promises.length) {
					dispatch(undefined, true);
				}
			},
			(e) => reject(e),
		),
	);

	return iterator;
};
