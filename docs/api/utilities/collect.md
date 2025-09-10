# collect()

The `collect()` function takes an async iterable or async iterator, iterates it
and returns an array of all yielded values.

```ts
async function numbers() {
	yield 1;
	yield 2;
	yield 3;
}

console.log(await collect(numbers())); // [1, 2, 3]
```
