/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var List = require('./list').List

var sequence = require('./sequence'),
    count = sequence.count,
    first = sequence.first, rest = sequence.rest, cons = cons

function Stream(head, rest) {
  this.head = head
  this.rest = rest
}
exports.Stream = Stream
Stream.prototype = Object.create(List.prototype)
Stream.prototype.length = Infinity

rest.define(Stream, function(stream) {
  return stream.tail || (stream.tail = stream.rest(stream))
})

function stream(head, rest) {
  return new Stream(head, rest)
}
exports.stream = stream

function iterate(f, value) {
  return stream(value, function(self) {
    return iterate(f, f(first(self)))
  })
}
exports.iterate = iterate

function repeat(value) {
  return stream(value, function() { return value })
}
exports.repeat = repeat
