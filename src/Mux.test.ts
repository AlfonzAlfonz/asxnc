import { collect } from "./collect.js";
import { Mux } from "./Mux.js";
import { Queue } from "./Queue.js";

test("Mux.join", async () => {
	const personQueue = Queue.create<{ name: string }>();
	const articleQueue = Queue.create<{ title: string }>();

	const mux = Mux.join({
		person: personQueue.iterator,
		article: articleQueue.iterator,
	});

	personQueue.dispatch({ value: { name: "jeff" }, done: false });
	articleQueue.dispatch({ value: { title: "name jeff" }, done: false });
	personQueue.dispatch({ value: undefined, done: true });
	articleQueue.dispatch({ value: undefined, done: true });

	const result = await collect(mux);

	expect(result).toEqual([
		["person", { name: "jeff" }],
		["article", { title: "name jeff" }],
	]);
});

test("Mux.split", async () => {
	const mux = Queue.create<
		["person", { name: string }] | ["article", { title: string }]
	>();

	mux.dispatch({ value: ["person", { name: "jeff" }], done: false });
	mux.dispatch({ value: ["article", { title: "name jeff" }], done: false });
	mux.dispatch({ value: undefined, done: true });
	mux.dispatch({ value: undefined, done: true });

	const { person, article } = Mux.split(["person", "article"], mux.iterator);

	const result = await Promise.all([collect(person), collect(article)]);

	expect(result).toEqual([
		[["person", { name: "jeff" }]],
		[["article", { title: "name jeff" }]],
	]);
}, 5000000);
