import { fork } from "../utils/fork";
import { demux } from "./demux";
import { mux } from "./mux";
import { queue } from "./queue";

test("example", () => {
	const getMuxed = () => {
		const open = queue<"open">();
		const close = queue<"close">();
		const iterator = mux({
			open: open.iterator,
			close: close.iterator,
		});
		return iterator;
	};

	const iterator = getMuxed();
	const { open, close } = demux(iterator);

	fork(
		async () => {
			for await (const e of open) {
			}
		},
		async () => {
			for await (const e of close) {
			}
		},
	);
});
