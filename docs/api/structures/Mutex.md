# Mutex

Mutex guaranties that only a single async operation has access to its value.
Ownership of the value is guarantied only during the acquire callback and should
not be accessed after. If acquire is called as some other process owns the
value, it will wait until that process releases the value.

```typescript
import { fork, Mutex, wait } from "asxnc";

const mutex = Mutex.create<number>();

// Although both acquires are called almost at the same time, only the first one
// receives the lock and the second one has to wait 3 seconds until the mutex is
// unlocked again.
fork([
	mutex.acquire(async () => {
		console.log("acquire 1 start");
		await wait(3, "s");
		console.log("acquire 1 end");
	}),
	mutex.acquire(async () => {
		console.log("acquire 2 start");
		await wait(3, "s");
		console.log("acquire 2 end");
	}),
]);
// Outputs:
// "acquire 1 start"
// "acquire 1 end"
// "acquire 2 start"
// "acquire 2 end"
```
