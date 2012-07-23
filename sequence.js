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

var make = Method()
exports.make = make

var isEmpty = Method(function(sequence) {
  return count(sequence) === 0
})
exports.isEmpty = isEmpty

function cons(head, tail) {
  return make(tail, head)
}
exports.cons = cons

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
