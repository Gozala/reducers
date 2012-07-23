/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var sequence = require('./sequence'),
    isEmpty = sequence.isEmpty, count = sequence.count,
    first = sequence.first, rest = sequence.rest

function List() {}
List.prototype.length = 0
List.prototype.toString = function() {
  var value = '', tail = this;
  while (!isEmpty(tail)) {
    value = value + ' ' + first(tail)
    tail = rest(tail)
  }

  return '(' + value.substr(1) + ')'
}

isEmpty.define(List, function(list) { return count(list) === 0 })
count.define(List, function(list) { return list.length })
first.define(List, function(list) { return list.head })
rest.define(List, function(list) { return list.tail })

function empty() {
  return new List()
}
exports.empty = empty
make.define(List, function(tail, head) { return new List(head, tail) })

function list() {
  var items = arguments, count = items.length, tail = empty()
  while (count--) tail = cons(items[count], tail)
  return tail;
}
exports.list = list

function filter(source, f) {
  return f(first(source)) ? cons(first(source), filter(rest(source)), f) :
                            filter(rest(source), f)
}
exports.filter = filter

function map(source, f) {
  return cons(f(first(source)), map(rest(source), f))
}
exports.map = map


