import { Multiplexed, multiplex } from "./multiplex";
import { Queue, queue } from "./queue";
import { asyncIterableIterator } from "../utils/asyncIterableIterator";
import { LabeledTuple, labeledTuple } from "../utils/labeledTuple";
import { toAsyncIterator } from "../utils/toAsyncIterator";
import { Prettify } from "../utils/types";

export interface AsxncEventTargetFunction {
	<TEvent extends Event>(
		collection: AsyncIterable<TEvent> | AsyncIterator<TEvent>,
		options?: AsxncEventTargetOptions,
	): AsxncEventTargetSubscriber<TEvent>;

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
	): AsxncEventTarget<TEvent, TDispatch>;
}

type AsxncEventTargetOptions = {
	globalCatch?: (e: unknown) => void;
};

type Event = [string, unknown];

export interface AsxncEventTargetSubscriber<TEvent extends Event> {
	event: <T extends TEvent[0]>(
		type: T,
	) => AsyncIterableIterator<Prettify<[T, unknown] & TEvent>[1]>;
	rest: () => AsyncIterableIterator<TEvent>;
	every: () => AsyncIterableIterator<TEvent>;
}

export type AsxncEventTarget<
	TEvent extends Event,
	TDispatch extends (v: IteratorResult<TEvent>) => unknown = (
		v: IteratorResult<TEvent>,
	) => unknown,
> = LabeledTuple<
	readonly [AsxncEventTargetSubscriber<TEvent>, TDispatch],
	readonly ["eventTarget", "dispatch"]
>;

/**
 *
 */
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

	let rest = null as Multiplexed<Queue<TEvent>> | null;
	let every = null as Multiplexed<Queue<TEvent>> | null;

	(async () => {
		while (true) {
			const result = await iterator.next().catch((e) => {
				if (options.globalCatch) {
					options.globalCatch(e);
					return;
				}

				if (every || rest) {
					if (every) {
						every[2](e);
					}
					if (rest) {
						rest[2](e);
					}
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
				if (every) {
					every[1](result);
				}
				break;
			} else {
				const subscriber = subscribers.get(result.value[0]);
				let handled = false;

				if (subscriber) {
					handled = true;
					subscriber[1](result);
				} else if (rest) {
					handled = true;
					rest[1](result);
				}

				if (every) {
					handled = true;
					every[1](result);
				}

				if (!handled) {
					console.warn(
						`Unexpected event (key: "${result.value[0]}"), event is discarded.`,
					);
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
				rest = multiplex(queue<TEvent>());
			}

			return asyncIterableIterator(rest[0][Symbol.asyncIterator]());
		},
		every: () => {
			if (!every) {
				every = multiplex(queue<TEvent>());
			}

			return asyncIterableIterator(every[0][Symbol.asyncIterator]());
		},
	} satisfies AsxncEventTargetSubscriber<Event>;
};
