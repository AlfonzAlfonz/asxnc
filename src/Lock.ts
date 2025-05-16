import { EjectedPromise } from "./EjectedPromise.js";

export type Lock = EjectedPromise<void>;

/**
 * The `Lock.create()` function returns a promise and a function to resolve
 * and another one to reject it. It is the same as `EjectedPromise.create<void>()`.
 *
 * @category Synchronization
 */
export const Lock = {
	create: (): Lock => EjectedPromise.create(),
};
