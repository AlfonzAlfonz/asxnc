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

	personQueue.dispatch({ name: "jeff" }, false);
	articleQueue.dispatch({ title: "name jeff" }, false);
	personQueue.dispatch(undefined, true);
	articleQueue.dispatch(undefined, true);

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

	mux.dispatch(["person", { name: "jeff" }], false);
	mux.dispatch(["article", { title: "name jeff" }], false);
	mux.dispatch(undefined, true);
	mux.dispatch(undefined, true);

	const { person, article } = Mux.split(["person", "article"], mux.iterator);

	const result = await Promise.all([collect(person), collect(article)]);

	expect(result).toEqual([
		[["person", { name: "jeff" }]],
		[["article", { title: "name jeff" }]],
	]);
});

test("Mux.adapter", async () => {
	const mux = Queue.create<
		["person", { name: string }] | ["article", { title: string }]
	>();

	mux.dispatch(["person", { name: "jeff" }], false);
	mux.dispatch(["article", { title: "name jeff" }], false);
	mux.dispatch(undefined, true);
	mux.dispatch(undefined, true);

	const result: any = {};

	Mux.adapter(mux.iterator, {
		article: (v: any) => {
			result.article = v;
		},
		person: (v: any) => {
			result.person = v;
		},
	});

	expect(result).toEqual([
		[["person", { name: "jeff" }]],
		[["article", { title: "name jeff" }]],
	]);
});
