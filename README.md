# MongoStash

[![Circle CI][ci-badge]][ci-link]
[![Code Climate][cc-badge]][cc-link]
[![Test Coverage][cov-badge]][cov-link]

Promisified wrapper around native MongoDB collections that offers transparent
caching by ID.

MongoStash is specifically designed for use cases where the vast majority of
database operations revolve around manipulating single records by their IDs.
Meanwhile, MongoStash preserves the ability to update or delete multiple records
while also preserving the integrity of the cache.

**NOTE**: `updateMany()` and `deleteMany()` are not atomic due to constraints of
MongoDB operations. They will first lookup all IDs that match the provided query,
then execute the update/delete operation. Therefore, any documents matching the
query inserted **after the initial lookup** will not be affected by these methods.
If you need atomicity, please use `updateSafe()` or `deleteSafe()`, which will
drop **all of the cache**.

**NOTE**: At this moment the functionality of this library is complete, but tests
are still being worked on. Until the badge above shows 100% test coverage, this
library should not be considered production-ready.

[ci-badge]: https://circleci.com/gh/jluchiji/mongo-stash.svg?style=svg
[ci-link]:  https://circleci.com/gh/jluchiji/mongo-stash

[cc-badge]: https://codeclimate.com/github/jluchiji/mongo-stash/badges/gpa.svg
[cc-link]: https://codeclimate.com/github/jluchiji/mongo-stash

[cov-badge]: https://codeclimate.com/github/jluchiji/mongo-stash/badges/coverage.svg
[cov-link]: https://codeclimate.com/github/jluchiji/mongo-stash/coverage
