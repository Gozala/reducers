/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var sequence = require('./sequence'),
    isEmpty = sequence.isEmpty, count = sequence.count,
    first = sequence.first, rest = sequence.rest,
    cons = sequence.cons, make = sequence.make, empty = sequence.empty

function List(head, tail) {
  this.head = head
  this.tail = tail || empty
  this.length = count(tail) + 1
}
List.prototype.length = 0
List.prototype.toString = function() {
  var value = '', tail = this;
  while (!isEmpty(tail)) {
    value = value + ' ' + first(tail)
    tail = rest(tail)
  }

  return '(' + value.substr(1) + ')'
}
exports.List = List

count.define(List, function(list) { return list.length })
first.define(List, function(list) { return list.head })
rest.define(List, function(list) { return list.tail })
make.define(List, function(tail, head) { return new List(head, tail) })

function list() {
  var items = arguments, count = items.length, tail = empty
  while (count--) tail = cons(items[count], tail)
  return tail
}
exports.list = list
