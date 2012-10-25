"use strict";

var hub = require("./hub")
var signal = require("./signal")

function channel() {
  /**
  Return a channel -- a sequence of events over time that may be reduced by
  one or more consumer functions.

  Channels are `signals` that have been transformed by `hub`, allowing them
  to be reduced more than once.
  **/
  return hub(signal())
}

module.exports = channel
