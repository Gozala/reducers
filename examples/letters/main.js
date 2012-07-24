/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true browser: true devel: true
         forin: true latedef: false globalstrict: true */
'use strict';

var open = require('../../dom').open
var core = require('../../core'),
    filter = core.filter, map = core.map

var reduce = require('../../accumulator').reduce


var mouseEvents = open(document.documentElement, 'mousemove')
var mousePositions = map(mouseEvents, function(event) {
  return { x: event.clientX, y: event.clientY }
})

var element = document.createElement('span')
element.textContent = 'hello world'
element.style.position = 'absolute'
document.body.appendChild(element)

reduce(mousePositions, function(result, position) {
  element.style.top = position.y + 10
  element.style.left = position.x + 20
})
