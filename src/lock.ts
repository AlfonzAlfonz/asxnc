import { EjectedPromise, ejectedPromise } from "./ejectedPromise";

export type Lock = EjectedPromise<void>;

/**
 * The `lock()` function returns a promise and a function to resolve
 * and another one to reject it. It is the same as `ejectedPromise<void>()`.
 *
 * @category Synchronization
 */
export const lock = (): Lock => ejectedPromise();
