# LimitedCollection

A Map with additional utility methods. This is used throughout discord.js rather than Arrays for anything that has
an ID, for significantly improved performance and ease-of-use.

```ts

class LimitedCollection extends Collection<K, V>

```

## Constructor

### `constructor`

## Properties

### `[species]`

**Type:** `MapConstructor` · **Modifiers:** readonly, static

### `[toStringTag]`

**Type:** `string` · **Modifiers:** readonly

### `interval`

The id of the interval being used to sweep.

**Type:** `Timeout | null`

### `keepOverLimit`

A function called to check if an entry should be kept when the Collection is at max size.

**Type:** `unknown | null`

### `maxSize`

The max size of the Collection.

**Type:** `number`

### `size`

**Type:** `number` · **Modifiers:** readonly

### `sweepFilter`

A function called every sweep interval that returns a function passed to `sweep`.

**Type:** `SweepFilter<K, V> | null`

## Methods

### `[iterator]`

Returns an iterable of entries in the map.

```ts

[iterator](): MapIterator<[K, V]>

```

**Returns:** `MapIterator<[K, V]>`

### `at`

Identical to Array.at().
Returns the item at a given index, allowing for positive and negative integers.
Negative integers count back from the last item in the collection.

```ts

at(index: number): V | undefined

```

- `index: number` — The index of the element to obtain

**Returns:** `V | undefined`

### `clear`

```ts

clear(): void

```

**Returns:** `void`

### `clone`

Creates an identical shallow copy of this collection.

```ts

clone(): Collection<K, V>

```

**Returns:** `Collection<K, V>`

```ts
const newColl = someColl.clone();
```

### `combineEntries`

Creates a Collection from a list of entries.

```ts

static combineEntries<Key, Value>(entries: Iterable<[Key, Value]>, combine: unknown): Collection<Key, Value>

```

- `entries: Iterable<[Key, Value]>` — The list of entries
- `combine: unknown` — Function to combine an existing entry with a new one

**Returns:** `Collection<Key, Value>`

```ts
Collection.combineEntries([["a", 1], ["b", 2], ["a", 2]], (x, y) => x + y);
// returns Collection { "a" => 3, "b" => 2 }
```

### `concat`

Combines this collection with others into a new collection. None of the source collections are modified.

```ts

concat(collections: ReadonlyCollection<K, V>[]): Collection<K, V>

```

- `collections: ReadonlyCollection<K, V>[]` — Collections to merge

**Returns:** `Collection<K, V>`

```ts
const newColl = someColl.concat(someOtherColl, anotherColl, ohBoyAColl);
```

### `delete`

```ts

delete(key: K): boolean

```

- `key: K`

**Returns:** `boolean`

### `difference`

Returns a new collection containing the items where the key is present in this collection but not the other.

```ts

difference(other: ReadonlyCollection<K, any>): Collection<K, V>

```

- `other: ReadonlyCollection<K, any>` — The other Collection to filter against

**Returns:** `Collection<K, V>`

```ts
const col1 = new Collection([['a', 1], ['b', 2]]);
const col2 = new Collection([['a', 1], ['c', 3]]);
console.log(col1.difference(col2));
// => Collection { 'b' => 2 }
console.log(col2.difference(col1));
// => Collection { 'c' => 3 }
```

### `each`

Identical to
Map.forEach(),
but returns the collection instead of undefined.

```ts

each(fn: unknown): this

```

- `fn: unknown` — Function to execute for each element

**Returns:** `this`

```ts
collection
 .each(user => console.log(user.username))
 .filter(user => user.bot)
 .each(user => console.log(user.username));
```

Identical to
Map.forEach(),
but returns the collection instead of undefined.

```ts

each<This>(fn: unknown, thisArg: This): this

```

- `fn: unknown` — Function to execute for each element
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `this`

```ts
collection
 .each(user => console.log(user.username))
 .filter(user => user.bot)
 .each(user => console.log(user.username));
```

### `ensure`

Obtains the value of the given key if it exists, otherwise sets and returns the value provided by the default value generator.

```ts

ensure(key: K, defaultValueGenerator: unknown): V

```

- `key: K` — The key to get if it exists, or set otherwise
- `defaultValueGenerator: unknown` — A function that generates the default value

**Returns:** `V`

```ts
collection.ensure(guildId, () => defaultGuildConfig);
```

### `entries`

Returns an iterable of key, value pairs for every entry in the map.

```ts

entries(): MapIterator<[K, V]>

```

**Returns:** `MapIterator<[K, V]>`

### `equals`

Checks if this collection shares identical items with another.
This is different to checking for equality using equal-signs, because
the collections may be different objects, but contain the same data.

```ts

equals(collection: ReadonlyCollection<K, V>): boolean

```

- `collection: ReadonlyCollection<K, V>` — Collection to compare with

**Returns:** `boolean`

### `every`

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every<NewKey>(fn: unknown): this

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `this`

```ts
collection.every(user => !user.bot);
```

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every<NewValue>(fn: unknown): this

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `this`

```ts
collection.every(user => !user.bot);
```

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every(fn: unknown): boolean

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `boolean`

```ts
collection.every(user => !user.bot);
```

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every<This, NewKey>(fn: unknown, thisArg: This): this

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `this`

```ts
collection.every(user => !user.bot);
```

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every<This, NewValue>(fn: unknown, thisArg: This): this

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `this`

```ts
collection.every(user => !user.bot);
```

Checks if all items passes a test. Identical in behavior to
Array.every().

```ts

every<This>(fn: unknown, thisArg: This): boolean

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `boolean`

```ts
collection.every(user => !user.bot);
```

### `filter`

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter<NewKey>(fn: unknown): Collection<NewKey, V>

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `Collection<NewKey, V>`

```ts
collection.filter(user => user.username === 'Bob');
```

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter<NewValue>(fn: unknown): Collection<K, NewValue>

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `Collection<K, NewValue>`

```ts
collection.filter(user => user.username === 'Bob');
```

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter(fn: unknown): Collection<K, V>

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `Collection<K, V>`

```ts
collection.filter(user => user.username === 'Bob');
```

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter<This, NewKey>(fn: unknown, thisArg: This): Collection<NewKey, V>

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `Collection<NewKey, V>`

```ts
collection.filter(user => user.username === 'Bob');
```

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter<This, NewValue>(fn: unknown, thisArg: This): Collection<K, NewValue>

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `Collection<K, NewValue>`

```ts
collection.filter(user => user.username === 'Bob');
```

Identical to
Array.filter(),
but returns a Collection instead of an Array.

```ts

filter<This>(fn: unknown, thisArg: This): Collection<K, V>

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `Collection<K, V>`

```ts
collection.filter(user => user.username === 'Bob');
```

### `filterByLifetime`

Create a sweepFilter function that uses a lifetime to determine sweepability.

> **Deprecated.** Use `Sweepers.filterByLifetime` instead

```ts

static filterByLifetime<K, V>(options?: LifetimeFilterOptions<K, V>): SweepFilter<K, V>

```

- `options?: LifetimeFilterOptions<K, V>` — The options used to generate the filter function

**Returns:** `SweepFilter<K, V>`

### `find`

Searches for a single item where the given function returns a truthy value. This behaves like
Array.find().
All collections used in Discord.js are mapped using their `id` property, and if you want to find by id you
should use the `get` method. See
MDN for details.

```ts

find<NewValue>(fn: unknown): NewValue | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `NewValue | undefined`

```ts
collection.find(user => user.username === 'Bob');
```

Searches for a single item where the given function returns a truthy value. This behaves like
Array.find().
All collections used in Discord.js are mapped using their `id` property, and if you want to find by id you
should use the `get` method. See
MDN for details.

```ts

find(fn: unknown): V | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `V | undefined`

```ts
collection.find(user => user.username === 'Bob');
```

Searches for a single item where the given function returns a truthy value. This behaves like
Array.find().
All collections used in Discord.js are mapped using their `id` property, and if you want to find by id you
should use the `get` method. See
MDN for details.

```ts

find<This, NewValue>(fn: unknown, thisArg: This): NewValue | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `NewValue | undefined`

```ts
collection.find(user => user.username === 'Bob');
```

Searches for a single item where the given function returns a truthy value. This behaves like
Array.find().
All collections used in Discord.js are mapped using their `id` property, and if you want to find by id you
should use the `get` method. See
MDN for details.

```ts

find<This>(fn: unknown, thisArg: This): V | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `V | undefined`

```ts
collection.find(user => user.username === 'Bob');
```

### `findKey`

Searches for the key of a single item where the given function returns a truthy value. This behaves like
Array.findIndex(),
but returns the key rather than the positional index.

```ts

findKey<NewKey>(fn: unknown): NewKey | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `NewKey | undefined`

```ts
collection.findKey(user => user.username === 'Bob');
```

Searches for the key of a single item where the given function returns a truthy value. This behaves like
Array.findIndex(),
but returns the key rather than the positional index.

```ts

findKey(fn: unknown): K | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `K | undefined`

```ts
collection.findKey(user => user.username === 'Bob');
```

Searches for the key of a single item where the given function returns a truthy value. This behaves like
Array.findIndex(),
but returns the key rather than the positional index.

```ts

findKey<This, NewKey>(fn: unknown, thisArg: This): NewKey | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `NewKey | undefined`

```ts
collection.findKey(user => user.username === 'Bob');
```

Searches for the key of a single item where the given function returns a truthy value. This behaves like
Array.findIndex(),
but returns the key rather than the positional index.

```ts

findKey<This>(fn: unknown, thisArg: This): K | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `K | undefined`

```ts
collection.findKey(user => user.username === 'Bob');
```

### `findLast`

Searches for a last item where the given function returns a truthy value. This behaves like
Array.findLast().

```ts

findLast<NewValue>(fn: unknown): NewValue | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `NewValue | undefined`

Searches for a last item where the given function returns a truthy value. This behaves like
Array.findLast().

```ts

findLast(fn: unknown): V | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `V | undefined`

Searches for a last item where the given function returns a truthy value. This behaves like
Array.findLast().

```ts

findLast<This, NewValue>(fn: unknown, thisArg: This): NewValue | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `NewValue | undefined`

Searches for a last item where the given function returns a truthy value. This behaves like
Array.findLast().

```ts

findLast<This>(fn: unknown, thisArg: This): V | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `V | undefined`

### `findLastKey`

Searches for the key of a last item where the given function returns a truthy value. This behaves like
Array.findLastIndex(),
but returns the key rather than the positional index.

```ts

findLastKey<NewKey>(fn: unknown): NewKey | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `NewKey | undefined`

Searches for the key of a last item where the given function returns a truthy value. This behaves like
Array.findLastIndex(),
but returns the key rather than the positional index.

```ts

findLastKey(fn: unknown): K | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)

**Returns:** `K | undefined`

Searches for the key of a last item where the given function returns a truthy value. This behaves like
Array.findLastIndex(),
but returns the key rather than the positional index.

```ts

findLastKey<This, NewKey>(fn: unknown, thisArg: This): NewKey | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `NewKey | undefined`

Searches for the key of a last item where the given function returns a truthy value. This behaves like
Array.findLastIndex(),
but returns the key rather than the positional index.

```ts

findLastKey<This>(fn: unknown, thisArg: This): K | undefined

```

- `fn: unknown` — The function to test with (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `K | undefined`

### `first`

Obtains the first value(s) in this collection.

```ts

first(): V | undefined

```

**Returns:** `V | undefined`

Obtains the first value(s) in this collection.

```ts

first(amount: number): V[]

```

- `amount: number` — Amount of values to obtain from the beginning

**Returns:** `V[]`

### `firstKey`

Obtains the first key(s) in this collection.

```ts

firstKey(): K | undefined

```

**Returns:** `K | undefined`

Obtains the first key(s) in this collection.

```ts

firstKey(amount: number): K[]

```

- `amount: number` — Amount of keys to obtain from the beginning

**Returns:** `K[]`

### `flatMap`

Maps each item into a Collection, then joins the results into a single Collection. Identical in behavior to
Array.flatMap().

```ts

flatMap<NewValue>(fn: unknown): Collection<K, NewValue>

```

- `fn: unknown` — Function that produces a new Collection

**Returns:** `Collection<K, NewValue>`

```ts
collection.flatMap(guild => guild.members.cache);
```

Maps each item into a Collection, then joins the results into a single Collection. Identical in behavior to
Array.flatMap().

```ts

flatMap<NewValue, This>(fn: unknown, thisArg: This): Collection<K, NewValue>

```

- `fn: unknown` — Function that produces a new Collection
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `Collection<K, NewValue>`

```ts
collection.flatMap(guild => guild.members.cache);
```

### `forEach`

Executes a provided function once per each key/value pair in the Map, in insertion order.

```ts

forEach(callbackfn: unknown, thisArg?: any): void

```

- `callbackfn: unknown`
- `thisArg?: any`

**Returns:** `void`

### `get`

Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.

```ts

get(key: K): V | undefined

```

- `key: K`

**Returns:** `V | undefined`

### `groupBy`

Groups members of an iterable according to the return value of the passed callback.

```ts

static groupBy<K, T>(items: Iterable<T>, keySelector: unknown): Map<K, T[]>

```

- `items: Iterable<T>` — An iterable.
- `keySelector: unknown` — A callback which will be invoked for each item in items.

**Returns:** `Map<K, T[]>`

### `has`

```ts

has(key: K): boolean

```

- `key: K`

**Returns:** `boolean`

### `hasAll`

Checks if all of the elements exist in the collection.

```ts

hasAll(keys: K[]): boolean

```

- `keys: K[]` — The keys of the elements to check for

**Returns:** `boolean`

### `hasAny`

Checks if any of the elements exist in the collection.

```ts

hasAny(keys: K[]): boolean

```

- `keys: K[]` — The keys of the elements to check for

**Returns:** `boolean`

### `intersection`

The intersection method returns a new collection containing the items where the key is present in both collections.

```ts

intersection(other: ReadonlyCollection<K, any>): Collection<K, V>

```

- `other: ReadonlyCollection<K, any>` — The other Collection to filter against

**Returns:** `Collection<K, V>`

```ts
const col1 = new Collection([['a', 1], ['b', 2]]);
const col2 = new Collection([['a', 1], ['c', 3]]);
const intersection = col1.intersection(col2);
console.log(col1.intersection(col2));
// => Collection { 'a' => 1 }
```

### `keyAt`

Identical to Array.at().
Returns the key at a given index, allowing for positive and negative integers.
Negative integers count back from the last item in the collection.

```ts

keyAt(index: number): K | undefined

```

- `index: number` — The index of the key to obtain

**Returns:** `K | undefined`

### `keys`

Returns an iterable of keys in the map

```ts

keys(): MapIterator<K>

```

**Returns:** `MapIterator<K>`

### `last`

Obtains the last value(s) in this collection.

```ts

last(): V | undefined

```

**Returns:** `V | undefined`

Obtains the last value(s) in this collection.

```ts

last(amount: number): V[]

```

- `amount: number` — Amount of values to obtain from the end

**Returns:** `V[]`

### `lastKey`

Obtains the last key(s) in this collection.

```ts

lastKey(): K | undefined

```

**Returns:** `K | undefined`

Obtains the last key(s) in this collection.

```ts

lastKey(amount: number): K[]

```

- `amount: number` — Amount of keys to obtain from the end

**Returns:** `K[]`

### `map`

Maps each item to another value into an array. Identical in behavior to
Array.map().

```ts

map<NewValue>(fn: unknown): NewValue[]

```

- `fn: unknown` — Function that produces an element of the new array, taking three arguments

**Returns:** `NewValue[]`

```ts
collection.map(user => user.tag);
```

Maps each item to another value into an array. Identical in behavior to
Array.map().

```ts

map<This, NewValue>(fn: unknown, thisArg: This): NewValue[]

```

- `fn: unknown` — Function that produces an element of the new array, taking three arguments
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `NewValue[]`

```ts
collection.map(user => user.tag);
```

### `mapValues`

Maps each item to another value into a collection. Identical in behavior to
Array.map().

```ts

mapValues<NewValue>(fn: unknown): Collection<K, NewValue>

```

- `fn: unknown` — Function that produces an element of the new collection, taking three arguments

**Returns:** `Collection<K, NewValue>`

```ts
collection.mapValues(user => user.tag);
```

Maps each item to another value into a collection. Identical in behavior to
Array.map().

```ts

mapValues<This, NewValue>(fn: unknown, thisArg: This): Collection<K, NewValue>

```

- `fn: unknown` — Function that produces an element of the new collection, taking three arguments
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `Collection<K, NewValue>`

```ts
collection.mapValues(user => user.tag);
```

### `merge`

Merges two Collections together into a new Collection.

```ts

merge<OtherValue, ResultValue>(other: ReadonlyCollection<K, OtherValue>, whenInSelf: unknown, whenInOther: unknown, whenInBoth: unknown): Collection<K, ResultValue>

```

- `other: ReadonlyCollection<K, OtherValue>` — The other Collection to merge with
- `whenInSelf: unknown` — Function getting the result if the entry only exists in this Collection
- `whenInOther: unknown` — Function getting the result if the entry only exists in the other Collection
- `whenInBoth: unknown` — Function getting the result if the entry exists in both Collections

**Returns:** `Collection<K, ResultValue>`

```ts
// Sums up the entries in two collections.
coll.merge(
 other,
 x => ({ keep: true, value: x }),
 y => ({ keep: true, value: y }),
 (x, y) => ({ keep: true, value: x + y }),
);
```

```ts
// Intersects two collections in a left-biased manner.
coll.merge(
 other,
 x => ({ keep: false }),
 y => ({ keep: false }),
 (x, _) => ({ keep: true, value: x }),
);
```

### `partition`

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition<NewKey>(fn: unknown): [Collection<NewKey, V>, Collection<Exclude<K, NewKey>, V>]

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `[Collection<NewKey, V>, Collection<Exclude<K, NewKey>, V>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition<NewValue>(fn: unknown): [Collection<K, NewValue>, Collection<K, Exclude<V, NewValue>>]

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `[Collection<K, NewValue>, Collection<K, Exclude<V, NewValue>>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition(fn: unknown): [Collection<K, V>, Collection<K, V>]

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `[Collection<K, V>, Collection<K, V>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition<This, NewKey>(fn: unknown, thisArg: This): [Collection<NewKey, V>, Collection<Exclude<K, NewKey>, V>]

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `[Collection<NewKey, V>, Collection<Exclude<K, NewKey>, V>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition<This, NewValue>(fn: unknown, thisArg: This): [Collection<K, NewValue>, Collection<K, Exclude<V, NewValue>>]

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `[Collection<K, NewValue>, Collection<K, Exclude<V, NewValue>>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

Partitions the collection into two collections where the first collection
contains the items that passed and the second contains the items that failed.

```ts

partition<This>(fn: unknown, thisArg: This): [Collection<K, V>, Collection<K, V>]

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `[Collection<K, V>, Collection<K, V>]`

```ts
const [big, small] = collection.partition(guild => guild.memberCount > 250);
```

### `random`

Obtains unique random value(s) from this collection.

```ts

random(): V | undefined

```

**Returns:** `V | undefined`

Obtains unique random value(s) from this collection.

```ts

random(amount: number): V[]

```

- `amount: number` — Amount of values to obtain randomly

**Returns:** `V[]`

### `randomKey`

Obtains unique random key(s) from this collection.

```ts

randomKey(): K | undefined

```

**Returns:** `K | undefined`

Obtains unique random key(s) from this collection.

```ts

randomKey(amount: number): K[]

```

- `amount: number` — Amount of keys to obtain randomly

**Returns:** `K[]`

### `reduce`

Applies a function to produce a single value. Identical in behavior to
Array.reduce().

```ts

reduce(fn: unknown, initialValue?: V): V

```

- `fn: unknown` — Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`, and `collection`
- `initialValue?: V` — Starting value for the accumulator

**Returns:** `V`

```ts
collection.reduce((acc, guild) => acc + guild.memberCount, 0);
```

Applies a function to produce a single value. Identical in behavior to
Array.reduce().

```ts

reduce<InitialValue>(fn: unknown, initialValue: InitialValue): InitialValue

```

- `fn: unknown` — Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`, and `collection`
- `initialValue: InitialValue` — Starting value for the accumulator

**Returns:** `InitialValue`

```ts
collection.reduce((acc, guild) => acc + guild.memberCount, 0);
```

### `reduceRight`

Applies a function to produce a single value. Identical in behavior to
Array.reduceRight().

```ts

reduceRight(fn: unknown, initialValue?: V): V

```

- `fn: unknown` — Function used to reduce, taking four arguments; `accumulator`, `value`, `key`, and `collection`
- `initialValue?: V` — Starting value for the accumulator

**Returns:** `V`

Applies a function to produce a single value. Identical in behavior to
Array.reduceRight().

```ts

reduceRight<InitialValue>(fn: unknown, initialValue: InitialValue): InitialValue

```

- `fn: unknown` — Function used to reduce, taking four arguments; `accumulator`, `value`, `key`, and `collection`
- `initialValue: InitialValue` — Starting value for the accumulator

**Returns:** `InitialValue`

### `reverse`

Identical to Array.reverse()
but returns a Collection instead of an Array.

```ts

reverse(): this

```

**Returns:** `this`

### `set`

Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.

```ts

set(key: K, value: V): this

```

- `key: K`
- `value: V`

**Returns:** `this`

### `some`

Checks if there exists an item that passes a test. Identical in behavior to
Array.some().

```ts

some(fn: unknown): boolean

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `boolean`

```ts
collection.some(user => user.discriminator === '0000');
```

Checks if there exists an item that passes a test. Identical in behavior to
Array.some().

```ts

some<This>(fn: unknown, thisArg: This): boolean

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `boolean`

```ts
collection.some(user => user.discriminator === '0000');
```

### `sort`

The sort method sorts the items of a collection in place and returns it.
The sort is not necessarily stable in Node 10 or older.
The default sort order is according to string Unicode code points.

```ts

sort(compareFunction?: Comparator<K, V>): this

```

- `compareFunction?: Comparator<K, V>` — Specifies a function that defines the sort order. If omitted, the collection is sorted according to each character's Unicode code point value, according to the string conversion of each element.

**Returns:** `this`

```ts
collection.sort((userA, userB) => userA.createdTimestamp - userB.createdTimestamp);
```

### `sweep`

Removes items that satisfy the provided filter function.

```ts

sweep(fn: unknown): number

```

- `fn: unknown` — Function used to test (should return a boolean)

**Returns:** `number`

Removes items that satisfy the provided filter function.

```ts

sweep<This>(fn: unknown, thisArg: This): number

```

- `fn: unknown` — Function used to test (should return a boolean)
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `number`

### `symmetricDifference`

Returns a new collection containing only the items where the keys are present in either collection, but not both.

```ts

symmetricDifference<OtherValue>(other: ReadonlyCollection<K, OtherValue>): Collection<K, V | OtherValue>

```

- `other: ReadonlyCollection<K, OtherValue>` — The other Collection to filter against

**Returns:** `Collection<K, V | OtherValue>`

```ts
const col1 = new Collection([['a', 1], ['b', 2]]);
const col2 = new Collection([['a', 1], ['c', 3]]);
const symmetricDifference = col1.symmetricDifference(col2);
console.log(col1.symmetricDifference(col2));
// => Collection { 'b' => 2, 'c' => 3 }
```

### `tap`

Runs a function on the collection and returns the collection.

```ts

tap(fn: unknown): this

```

- `fn: unknown` — Function to execute

**Returns:** `this`

```ts
collection
 .tap(coll => console.log(coll.size))
 .filter(user => user.bot)
 .tap(coll => console.log(coll.size))
```

Runs a function on the collection and returns the collection.

```ts

tap<This>(fn: unknown, thisArg: This): this

```

- `fn: unknown` — Function to execute
- `thisArg: This` — Value to use as `this` when executing the function

**Returns:** `this`

```ts
collection
 .tap(coll => console.log(coll.size))
 .filter(user => user.bot)
 .tap(coll => console.log(coll.size))
```

### `toJSON`

```ts

toJSON(): [K, V][]

```

**Returns:** `[K, V][]`

### `toReversed`

Identical to Array.toReversed()
but returns a Collection instead of an Array.

```ts

toReversed(): Collection<K, V>

```

**Returns:** `Collection<K, V>`

### `toSorted`

The sorted method sorts the items of a collection and returns it.
The sort is not necessarily stable in Node 10 or older.
The default sort order is according to string Unicode code points.

```ts

toSorted(compareFunction?: Comparator<K, V>): Collection<K, V>

```

- `compareFunction?: Comparator<K, V>` — Specifies a function that defines the sort order. If omitted, the collection is sorted according to each character's Unicode code point value, according to the string conversion of each element.

**Returns:** `Collection<K, V>`

```ts
collection.sorted((userA, userB) => userA.createdTimestamp - userB.createdTimestamp);
```

### `union`

Returns a new collection containing the items where the key is present in either of the collections.

```ts

union<OtherValue>(other: ReadonlyCollection<K, OtherValue>): Collection<K, V | OtherValue>

```

- `other: ReadonlyCollection<K, OtherValue>` — The other Collection to filter against

**Returns:** `Collection<K, V | OtherValue>`

```ts
const col1 = new Collection([['a', 1], ['b', 2]]);
const col2 = new Collection([['a', 1], ['b', 3], ['c', 3]]);
const union = col1.union(col2);
console.log(union);
// => Collection { 'a' => 1, 'b' => 2, 'c' => 3 }
```

### `values`

Returns an iterable of values in the map

```ts

values(): MapIterator<V>

```

**Returns:** `MapIterator<V>`

---

Source: https://github.com/xirothedev/discord.js-selfbot/blob/main/packages/discord-ts-selfbot/src/util/LimitedCollection.ts#L38
