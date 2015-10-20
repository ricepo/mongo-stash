# MongoStash

[![Circle CI][ci-badge]][ci-link]
[![Code Climate][cc-badge]][cc-link]
[![Test Coverage][cov-badge]][cov-link]

MongoStash is a thin wrapper around [mongodb][native-link] collections that
provides transparent caching by ID via [lru-cache][lru-link].

MongoStash is designed for use cases where the vast majority of database
operations revolve around manipulating single records by their IDs. Meanwhile,
MongoStash preserves the ability to update/delete multiple records while keeping
the cache integrity.

# Getting Started
```sh
$ npm install mongo-stash --save
```

# Documentation

## Core

###`MongoStash(collection[, options])`

Creates a new MongoStash instance wrapping the `collection`. You can optionally
specify caching parameters using the `options` arguments, which is directly
passed to the underlying LRU cache.

```js
const MongoDB    = require('mongodb');
const MongoStash = require('mongo-stash');

/* You need a native mongodb connection first */
const db = yield MongoDB.connect('mongodb://localhost:27017/test');

/* Then, create the MongoStash wrapper */
const stash = MongoStash(db.collection('foo'), { max: 1000, maxAge: 60 });
 ```

### `defaults`
An object of a function specifying default properties and their values for every
inserted document (e.g. timestamp).

If it is an object, it will be merged into new document before insertion.

If it is a function, it will be called with the new document as the only argument,
then the result will be merged into the new document.

```js
const stash = MongoStash(collection);
stash.defaults = (doc) => ({ timestamp: new Date() });

const result = yield stash.insertOne({ foo: 'bar' });
/* result: { _id: ObjectID(...), foo: 'bar', timestamp: Date(...) } */
```

### `projection`
Default projection for uncached find operations.
```js
const stash = MongoStash(collection);
stash.projection = { fields: { index: false } };

yield stash.insertOne({ foo: 'bar', index: 1 });
const result = yield stash.find();
/* result: [{ _id: ObjectID(...), foo: 'bar' }] */
```

### `safeMode`
If set to `true` forces all update/delete operations on multiple documents to
wipe entire cache. Usually not needed.
```js
const stash = MongoStash(collection);
stash.safeMode = true;

yield stash.deleteMany({ foo: 'bar' });
/* Cache is reset at this point */
```

## Find

### `findById(id)`
Finds a document by its ID, retrieving it from cache if possible. The `id` can
be either a string or a BSON ObjectID.

```js
const stash = MongoStash(collection);

/* Queries the database, since the ObjectID is not cached */
const document = yield stash.findById('5625eb34622fcb9b5937677f');

/* Does not query the database, retrieves from cache instead */
const another = yield stash.findById('5625eb34622fcb9b5937677f');
```

### `find(query, proj)`
Equivalent to the native `Collection.find()` method. MongoStash cannot cache by
query, therefore this method cannot utilize caching capabilities.

```js
const stash = MongoStash(collection);

const results = yield stash.find({ index: { $gt: 100 } });
```

### `findOne(query, proj)`
Equivalent to the native `Collection.findOne()` method. MongoStash cannot cache by
query, therefore this method cannot utilize caching capabilities.

**NOTE:** If you need to find a document by its ID, consider using `findById()`
instead to utilize caching.

```js
const stash = MongoStash(collection);

const result = yield stash.findOne({ index: 3 });
```

## Insert
### `insertOne(doc [, options])`
Inserts one document into the collection, also caching it. You can optionally
specify `options`, which are passed to the native `insertOne()` method.

Before inserting, the `doc` is merged with the `MongoStash.defaults`. The
`doc` is not modified during the merging process.

```js
const stash = MongoStash(collection);

const result = yield stash.insertOne({ index: 3 });
```

### `insertMany(docs [, options])`
Inserts multiple documents into the collection, also caching them. You can optionally
specify `options`, which are passed to the native `insertMany()` method.

Before inserting, each of `docs` is merged with the `MongoStash.defaults`.
The `docs` are not modified during the merging process.

```js
const stash = MongoStash(collection);

const result = yield stash.insertMany([{ index: 3 }, { index: 4 }]);
```

## Update
### `updateOne(id, changes[, options])`
Updates a single document by its ID, also caching the change. You can optionally
specify `options`, which are passed to the native `findOneAndUpdate()` method.

```js
const stash = MongoStash(collection);

const id = '5625eb34622fcb9b5937677f';
const result = yield stash.updateOne(id, { $set: { index: 9 } });
```

### `updateMany(query, changes[, options])`
Updates multiple documents, dropping matched documents from cache. You can optionally
specify `options`, which are passed to the native `updateMany()` method.

**NOTE:** This method is executed using two queries by first looking up matching
IDs, then performing the update on them. Any documents inserted **after** the initial
lookup will not be updated. If you need to prevent this, consider using `updateSafe()`
or setting `MongoStash.safeMode` to true.

```js
const stash = MongoStash(collection);

const result = yield stash.updateMany({ index: { $lt: 20 } }, { $set: { index: 9 } });
```

### `updateSafe(query, changes[, options])`
Updates multiple documents in one query, dropping **all** of the cache. You can optionally
specify `options`, which are passed to the native `updateMany()` method.

If `MongoStash.safeMode` is true, all calls to `updateMany()` will be redirected here.

```js
const stash = MongoStash(collection);

const result = yield stash.updateSafe({ index: { $lt: 20 } }, { $set: { index: 9 } });
```

## Delete
### `deleteOne(id)`
Deletes a single document by its ID, dropping it from the cache.

```js
const stash = MongoStash(collection);

const id = '5625eb34622fcb9b5937677f';
const result = yield stash.deleteOne(id);
```

### `deleteMany(query)`
Deletes multiple documents, dropping them from cache.

**NOTE:** This method is executed using two queries by first looking up matching
IDs, then performing the delete on them. Any documents inserted **after** the initial
lookup will not be deleted. If you need to prevent this, consider using `deleteSafe()`
or setting `MongoStash.safeMode` to true.

```js
const stash = MongoStash(collection);

const result = yield stash.deleteMany({ index: { $lt: 20 } });
```

### `deleteSafe(query)`
Deletes multiple documents in one query, dropping **all** of the cache.

If `MongoStash.safeMode` is true, all calls to `deleteMany()` will be redirected here.

```js
const stash = MongoStash(collection);

const result = yield stash.deleteSafe({ index: { $lt: 20 } });
```


[ci-badge]: https://circleci.com/gh/jluchiji/mongo-stash.svg?style=svg
[ci-link]:  https://circleci.com/gh/jluchiji/mongo-stash

[cc-badge]: https://codeclimate.com/github/jluchiji/mongo-stash/badges/gpa.svg
[cc-link]: https://codeclimate.com/github/jluchiji/mongo-stash

[cov-badge]: https://codeclimate.com/github/jluchiji/mongo-stash/badges/coverage.svg
[cov-link]: https://codeclimate.com/github/jluchiji/mongo-stash/coverage

[native-link]: https://github.com/mongodb/node-mongodb-native
[lru-link]: https://github.com/isaacs/node-lru-cache
