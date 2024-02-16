import { collect } from "./collect";
import { ejectedPromise, EjectedPromise } from "./ejectedPromise";
import { eventTarget } from "./eventTarget";
import { fork } from "./fork";
import { lock, Lock } from "./lock";
import { pubsub, PubSub } from "./pubsub";
import { queue, Queue } from "./queue";
import { asyncIterableIterator } from "./utils/asyncIterableIterator";
import { instant } from "./utils/instant";
import { isIterable } from "./utils/isIterable";
import { isIterator } from "./utils/isIterator";

export const asxnc = {
	asyncIterableIterator,
	collect,
	ejectedPromise,
	eventTarget,
	fork,
	instant,
	isIterable,
	isIterator,
	lock,
	pubsub,
	queue,
};

export {
	asyncIterableIterator,
	collect,
	ejectedPromise,
	eventTarget,
	fork,
	instant,
	isIterable,
	isIterator,
	lock,
	pubsub,
	queue,
};

export type { EjectedPromise, Lock, PubSub, Queue };
