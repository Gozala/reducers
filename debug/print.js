"use strict";

var reduce = require("reducible/reduce")
var reducible = require("reducible/reducible")
var end = require("reducible/end")
var isError = require("reducible/is-error")

var PREFIX = "\u200B"
var DELIMITER = PREFIX + " "
var OPEN = PREFIX + "<---" 
var CLOSE = PREFIX + "--->" 
var ERROR = PREFIX + "\u26A1 "

var SPECIALS = [ OPEN, CLOSE, ERROR, DELIMITER ]

var write = (function() {
  if (typeof(process) !== "undefined" &&
      typeof(process.stdout) !== "undefined" &&
      typeof(process.stdout.write) === "function") {
    var inspect = require("util").inspect
    var slicer = Array.prototype.slice
    return function write() {
      var message = slicer.call(arguments).map(function($) {
        return SPECIALS.indexOf($) >= 0 ? $ : inspect($)
      }).join("")
      process.stdout.write(message)
    }
  } else {
    return console.log.bind(console)
  }
})()

function print(source, delimiter) {
  var open = false
  
  delimiter = delimiter || DELIMITER
  
  reduce(source, function reducePrintSource(value) {
    if (!open) write(OPEN)
    open = true

    if (value === end) write(CLOSE)
    else if (isError(value)) write(ERROR, value, DELIMITER, CLOSE)
    else write(value, DELIMITER)
  })
}

module.exports = print
