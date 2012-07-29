/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var Method = require('method')

var count = Method()
exports.count = count

var first = Method()
exports.first = first

var rest = Method()
exports.rest = rest

var isEmpty = Method()
exports.isEmpty = isEmpty

isEmpty.define(Array, function(array) { return array.length === 0 })
count.define(Array, function(array) { return array.length })
first.define(Array, function(array) { return array[0] })
rest.define(Array, function(array) { return array.slice(1) })


function expand(form) {
  return form.operation.apply(form, form.body)
}

function Sequence(head, tail) {
  this.head = head
  this.tail = tail
}
Sequence.prototype.toString = function() {
  var value = '', tail = this;
  while (!isEmpty(tail)) {
    value = value + ' ' + first(tail)
    tail = rest(tail)
  }

  return '(' + value.substr(1) + ')'
}
Sequence.head = function head(sequence) {
  return sequence.head
}
Sequence.tail = function tail(sequence) {
  var form = sequence.tail
  return form.isExpandable ? (sequence.tail = expand(form)) :
                             form.tail
}

first.define(Sequence, Sequence.head)
rest.define(Sequence, Sequence.tail)
isEmpty.define(Sequence, function() { return false })
count.define(Sequence, function(sequence) {
  return count(rest(sequence)) + 1
})

function LazySequence(operation, body) {
  this.operation = operation
  this.body = body
  this.isExpandable = true
}
LazySequence.prototype = Object.create(Sequence.prototype)

;[ first, rest, count, isEmpty ].forEach(function(method) {
  method.define(LazySequence, function(form) {
    var sequence = expand(form)
    delete form.isExpandable
    delete form.operation
    delete form.body

    if (isEmpty(sequence)) {
      isEmpty.implement(form, function() { return true })
    } else {
      form.head = sequence.head
      form.tail = sequence.tail
      first.implement(form, Sequence.head)
      rest.implement(form, Sequence.tail)
    }

    return method(sequence)
  })
})

function cons(head, rest) {
  return new Sequence(head, rest)
}
exports.cons = cons

function lazy(operation) {
  return function transform() {
    return new LazySequence(operation, arguments)
  }
}
exports.lazy = lazy

function next(source) {
  return rest(source)
}
exports.next = next

function second(source) {
  return first(rest(source))
}
exports.second = second

function third(source) {
  return first(rest(rest(source)))
}
exports.third = third

var filter = lazy(function(source, f) {
  return isEmpty(source) ? source :
         f(first(source)) ? cons(first(source), filter(rest(source), f)) :
                            filter(rest(source), f)
})
exports.filter = filter

var map = lazy(function(source, f) {
  return isEmpty(source) ? source :
                           cons(f(first(source)), map(rest(source), f))
})
exports.map = map

var take = lazy(function(source, n) {
  return isEmpty(source) ? source :
          n <= 0 ? [] :
          cons(first(source), take(rest(source), n - 1))
})
exports.take = take

var drop = lazy(function(source, n) {
  return isEmpty(source) ? source :
         n <= 0 ? source :
         drop(rest(source), n - 1)
})
exports.drop = drop

var takeWhile = lazy(function(source, predicate) {
  var head = first(source)
  return isEmpty(source) ? source :
         predicate(head) ? cons(head, takeWhile(rest(source), predicate)) :
         []
})
exports.takeWhile = takeWhile

var dropWhile = lazy(function dropWhile(source, predicate) {
  var head = first(source)
  return isEmpty(source) ? source :
         predicate(head) ? dropWhile(rest(source), predicate) :
         rest(source)
})
exports.dropWhile = dropWhile
