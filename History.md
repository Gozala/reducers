# Changes

## 0.1.6 / 2012-10-26

  - Add a lot more tests.
  - Create index with all end user functions.
  - Fix subtle bug in `hub` implementation.
  - Fix bug in `delay` implementation.

## 0.1.5 / 2012-10-25

  - Fix bug in implementation of `capture` that caused multiple ends.
  - Implement `delay` utility module.
  - Fix flatten that in edge cases leaked end of stream before it actually ended.
  - Implement lot's of new tests.

## 0.1.4 / 2012-10-24

  - Add transformation support for primitive types.

## 0.1.3 / 2012-10-24

  - Removed JSHint comments.
  - Remove experimental modules.
  - Implement `zip` function.
  - Remove dependency on zip package.

## 0.1.2 / 2012-10-24

  - Make `reduce` API on eventuals equivalent of API on values they resolve to.

## 0.1.1 / 2012-10-23

  - Define implementation of `accumulate` for eventual data types.

## 0.1.0 / 2012-10-21

  - Refactor reducers into idiomatic node structure of function per module.
  - Document each individual function.

## 0.0.3 / 2012-10-15

  - Implement client http API for reducers.
  - Implement clojure like `reductions` function.
  - Implement experimental `adjust` function.
  - Implement `concat` for parallel data structures.
  - Update to eventuals@0.3.0

## 0.0.2 / 2012-07-23

  - Rename channel abstraction to signal and define alternative
    channel abstraction
  - Implement lazy stream abstraction.
  - Extend `accumulate` with a default implementation for all values.
  - Define experimental `Binoid` type.
  - Define `sequential` decorator.
  - Implement error handling for reducers.
  - Implement `capture` function for error handling.
  - Implement `hub` function for sharing sequences across multiple consumers.
  - Make core independent of `promise` abstraction.
  - Implement `list` type.

## 0.0.1 / 2012-05-19

  - Initial release

