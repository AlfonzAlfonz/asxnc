import { Lock } from "./Lock.js";

export interface Mutex<T> {
	acquire<U>(cb: (v: T) => Promise<U>): Promise<U>;
	acquire<U>(cb: (v: T) => AsyncGenerator<U>): Promise<AsyncGenerator<U>>;

	acquireSync<U>(cb: (v: T) => U): Promise<U>;
}

/**
 * Mutex guaranties that only a single async operation has access to its
 * value. Ownership of the value is guarantied only during the acquire callback
 * and should not be accessed after. If acquire is called when some other
 * process own the value, it will wait until that process releases the value.
 */
export const Mutex = {
	create: <T>(value: T): Mutex<T> => {
		let lock: Lock | undefined;

		const execute = <U>(cb: (v: T) => Promise<U> | AsyncGenerator<U>) => {
			lock = Lock.create();
			return cleanupAfterAsync(cb(value), () => release());
		};

		const release = () => {
			lock?.resolve();
			lock = undefined;
		};

		return {
			acquire: async <U>(cb: (v: T) => Promise<U> | AsyncGenerator<U>) => {
				while (true) {
					if (!lock) {
						break;
					}
					await lock.promise;
				}
				return await execute(cb);
			},
			acquireSync: async <U>(cb: (v: T) => U) => {
				while (true) {
					if (!lock) {
						break;
					}
					await lock.promise;
				}
				return cb(value);
			},
		};
	},
};

const cleanupAfterAsync = async <T>(
	asyncOperation: Promise<T> | AsyncGenerator<T>,
	cleanup: () => Promise<unknown> | void,
) => {
	async function* handleAsyncIterator<U>(iterator: AsyncGenerator<U>) {
		try {
			for await (const value of iterator) {
				yield value;
			}
		} catch (e) {
			await cleanup();
			throw e;
		}
		await cleanup();
	}

	if ("then" in asyncOperation) {
		const result = await asyncOperation.catch((e) => {
			cleanup();
			throw e;
		});
		await cleanup();
		return result;
	} else {
		return handleAsyncIterator(asyncOperation);
	}
};
