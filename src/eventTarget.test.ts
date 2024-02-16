import { eventTarget } from "./eventTarget";
import { fork } from "./fork";
import { pubsub } from "./pubsub";

test("eventTarget", async () => {
	type Event =
		| ["open", { hello: string }]
		| ["close", { aaaaa: boolean }]
		| ["meh", {}];

	const [target, dispatch] = eventTarget(pubsub<Event>());

	let openCount = 0;

	await fork(
		async () => {
			for await (const e of target.event("open")) {
				openCount++;
				expect(e).toMatchObject({ hello: "world" });
			}
		},
		async () => {
			for await (const e of target.event("open")) {
				openCount++;
			}
		},
		async () => {
			for await (const e of target.event("close")) {
				expect(e).toMatchObject({ aaaaa: true });
			}
		},
		async () => {
			await dispatch({ done: false, value: ["open", { hello: "world" }] });
			await dispatch({ done: false, value: ["close", { aaaaa: true }] });
			await dispatch({ done: false, value: ["meh", {}] });
			await dispatch({ done: true, value: undefined });
		},
		async () => {
			for await (const [type, e] of target.rest()) {
				expect([type, e]).toMatchObject([type, {}]);
			}
		},
	);

	expect(openCount).toBe(2);
});
