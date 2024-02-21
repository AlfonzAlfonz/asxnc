import {
	AsxncEventTarget,
	AsxncEventTargetSubscriber,
	eventTarget,
} from "./collections/eventTarget";
import { PubSub, pubsub } from "./collections/pubsub";
import { Queue, queue } from "./collections/queue";
import { Registry, registry } from "./collections/registry";
import { instant } from "./scheduling/instant";
import { wait } from "./scheduling/wait";
import {
	EjectedPromise,
	ejectedPromise,
} from "./synchronization/ejectedPromise";
import { Lock, lock } from "./synchronization/lock";
import { asyncIterableIterator } from "./utils/asyncIterableIterator";
import { collect } from "./utils/collect";
import { fork } from "./utils/fork";
import { isIterable } from "./utils/isIterable";
import { isIterator } from "./utils/isIterator";
import { LabeledTuple, labeledTuple } from "./utils/labeledTuple";
import { race } from "./utils/race";

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
	wait,
	registry,
	labeledTuple,
	race,
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
	labeledTuple,
	lock,
	pubsub,
	queue,
	race,
	registry,
	wait,
};

export type {
	AsxncEventTarget,
	AsxncEventTargetSubscriber,
	EjectedPromise,
	LabeledTuple,
	Lock,
	PubSub,
	Queue,
	Registry,
};
