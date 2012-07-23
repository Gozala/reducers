/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var List = require('./list').List

var sequence = require('./sequence'),
    count = sequence.count,
    first = sequence.first, rest = sequence.rest, cons = cons,
    isEmpty = sequence.isEmpty, empty = sequence.empty

function Binoid(left, right) {
  this.left = left || null
  this.right = right || null
}
Binoid.prototype.toString = function toString() {
  var value = '', tail = this.left;
  while (!isEmpty(tail)) {
    value = value + ' ' + first(tail)
    tail = rest(tail)
  }
  tail = this.right
  while (!isEmpty(tail)) {
    value = value + ' ' + first(tail)
    tail = rest(tail)
  }

  return '(' + value.substr(1) + ')'
 
}

first.define(Binoid, function(self) {
  return self.left ? first(self.left) :
         self.right ? first(self.right) :
         null
})

rest.define(Binoid, function(self) {
  var tail = rest(self.left)
  return isEmpty(tail) ? self.right :
                         new Binoid(tail, self.right)
})

count.define(Binoid, function(self) {
  return count(self.left) + count(self.right)
})

exports.concat = function concat(left, right) {
  return new Binoid(left, right)
}
