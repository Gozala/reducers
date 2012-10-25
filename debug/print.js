"use strict";

var reduce = require("../reduce")
var when = require("eventual/when")

function print(source) {
  var open = false
  var promise = reduce(source, function(_, value) {
    if (!open) process.stdout.write("<stream ")
    open = true
    process.stdout.write(JSON.stringify(value, 2, 2) + " ")
  }, false)
  when(promise, function() {
    if (!open) process.stdout.write("<stream ")
    process.stdout.write("/>\n> ")
  }, function(error) {
    if (!open) process.stdout.write('<stream ')
    process.stdout.write("/Error: ")
    process.stdout.write(error + " " + JSON.stringify(error, 2, 2))
    process.stdout.write(">\n> ")
  })
}

module.exports = print
