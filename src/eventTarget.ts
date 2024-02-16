import { multiplex } from "./multiplex";
import { queue } from "./queue";
import { asyncIterableIterator } from "./utils/asyncIterableIterator";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";
import { toAsyncIterator } from "./utils/toAsyncIterator";
import { Prettify } from "./utils/types";

export interface AsxncEventTargetFunction {
	<TEvent extends Event>(
		collection: AsyncIterable<TEvent> | AsyncIterator<TEvent>,
		options?: AsxncEventTargetOptions,
	): AsxncEventTarget<TEvent>;

	<
		TEvent extends Event,
		TDispatch extends (v: IteratorResult<TEvent>) => unknown,
	>(
		collection: readonly [
			AsyncIterable<TEvent> | AsyncIterator<TEvent>,
			TDispatch,
			unknown,
		],
		options?: AsxncEventTargetOptions,
	): LabeledTuple<
		readonly [AsxncEventTarget<TEvent>, TDispatch],
		readonly ["eventTarget", "dispatch"]
	>;
}

type AsxncEventTargetOptions = {
	globalCatch?: (e: unknown) => void;
};

type Event = [string, unknown];

export interface AsxncEventTarget<TEvent extends Event> {
	event: <T extends TEvent[0]>(
		type: T,
	) => AsyncIterableIterator<Prettify<[T, unknown] & TEvent>[1]>;
	rest: () => AsyncIterableIterator<TEvent>;
}

export const eventTarget: AsxncEventTargetFunction = (
	collection: any,
	options: any = {},
): any => {
	if (Array.isArray(collection)) {
		return labeledTuple(
			[_eventTarget(collection[0], options), collection[1]],
			["eventTarget", "dispatch"],
		);
	} else {
		return _eventTarget(collection, options);
	}
};

const _eventTarget = <TEvent extends Event>(
	collection: AsyncIterable<TEvent> | AsyncIterator<TEvent>,
	options: AsxncEventTargetOptions,
) => {
	const iterator = toAsyncIterator(collection);
	const subscribers = new Map<
		string,
		[AsyncIterable<TEvent[1]>, (value: IteratorResult<TEvent, unknown>) => void]
	>();

	let rest: [
		AsyncIterable<TEvent>,
		(value: IteratorResult<TEvent, unknown>) => void,
		(e: unknown) => void,
	] = null!;

	(async () => {
		while (true) {
			const result = await iterator.next().catch((e) => {
				if (rest) {
					rest[2](e);
					return;
				}
				if (options.globalCatch) {
					options.globalCatch(e);
					return;
				}
				throw e;
			});

			if (!result) {
				continue;
			}

			if (result.done) {
				for (const [, dispatch] of subscribers.values()) {
					dispatch(result);
				}
				if (rest) {
					rest[1](result);
				}
			} else {
				const subscriber = subscribers.get(result.value[0]);
				if (subscriber) {
					subscriber[1](result);
				} else {
					rest[1](result);
				}
			}
		}
	})();

	return {
		event: (type) => {
			let subscriber = subscribers.get(type);
			if (!subscriber) {
				const [it, di] = multiplex(queue<TEvent[1]>());
				subscriber = [
					it,
					(v) => di(v.done ? v : { done: false, value: v.value[1] }),
				];
				subscribers.set(type, subscriber);
			}

			return asyncIterableIterator(subscriber[0][Symbol.asyncIterator]());
		},
		rest: () => {
			if (!rest) {
				const [a, b, c] = queue<TEvent>();
				rest = [a, b, c];
			}

			return asyncIterableIterator(rest[0][Symbol.asyncIterator]());
		},
	} satisfies AsxncEventTarget<Event>;
};
