import { asyncIterableIterator } from "..";
import { toAsyncIterator } from "../utils/toAsyncIterator";
import { Prettify } from "../utils/types";
import { Queue, queue } from "./queue";

export const demux = <TEvent extends [string, unknown]>(
	collection: AsyncIterable<TEvent> | AsyncIterator<TEvent>,
) => {
	const iterator = toAsyncIterator(collection);
	const subscribers = new Map<
		string,
		[
			AsyncIterable<TEvent[1]>,
			(value: IteratorResult<TEvent[1], unknown>) => void,
		][]
	>();

	let rest: Queue<TEvent>[] = [];
	let every: Queue<TEvent>[] = [];

	return {
		event: <T extends TEvent[0]>(key: T) => {
			const [it, d] = queue<Prettify<[T, unknown] & TEvent>[1]>();
			!subscribers.has(key) && subscribers.set(key, []);
			const index = subscribers.get(key)!.push([it, d]) - 1;

			return asyncIterableIterator({
				next: async () => {
					const queuedValue = it.shiftSync();
					if (queuedValue) {
						return queuedValue;
					}

					const result = await iterator.next();

					if (result.done) {
						// Broadcast done result to all subsribers
						for (const [, subs] of subscribers) {
							subs.forEach(([, dispatch], i) => {
								if (result.value[0] === key && index === i) return;
								dispatch(result);
							});
						}
					} else {
						// Broadcast other results to all other subsribers of the same key
						const eventSubs = subscribers.get(result.value[0]);
						if (eventSubs && eventSubs.length) {
							subscribers.get(key)!.forEach(([, dispatch], i) => {
								// skip dispatching for the curently evaluated event
								if (result.value[0] === key && index === i) return;
								dispatch({ value: result.value[1], done: false });
							});
						} else {
							console.warn(
								`Unexpected event (key: "${result.value[0]}"), event is discarded.`,
							);
						}
					}

					return result;
				},
			});
		},
		rest: () => {},
		every: () => {},
	};
};

type FromEntries<T extends [string, unknown]> = {
	[K in T[0]]: Prettify<[K, unknown] & T>[1];
};
