# pulse()

The `pulse()` function returns an async iterator which yields in set interval by
duration.

```ts
for await (const _ of pulse(200, "ms")) {
	console.log("hello"); // logs "hello" every 200ms
}
```
