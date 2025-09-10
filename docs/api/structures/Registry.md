# Registry

Registry is a dictionary-like data structure for storing key-value data.
Multiple consumers may wait (using `waitFor()`) for registering (using
`register()`) a new value for a given key.

```ts title="Simple dependency injection example"
/*
This is very basic implementation, which is missing important features
such as cycle detection or scopes, but can be used as a base for creating a 
more robust implementation.
*/

type DI =
	| ["db", Db]
	| ["users", UserRepository]
	| ["products", ProductRepository];

const app = Registry.create<DI>();

await fork([
	async () => {
		const db = await createDbConnection();

		app.register("db", db);
	},
	async () => {
		const db = await app.waitFor("db");

		app.register("users", new UserRepository(db));
	},
	async () => {
		const db = await app.waitFor("db");

		app.register("products", new ProductRepository(db));
	},
]);

const products = app.getSync("products");
await products.list();

const users = app.getSync("users");
await users.list();
```
