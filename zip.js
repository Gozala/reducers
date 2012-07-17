var zip = new function() {
  var end = {}
  function drained(branch) { return !branch.queued.length }
  function pending(branch) { return branch.queued.length }
  function shift(branch) { return branch.queued.shift() }
  function ended(branch) { return branch.queued[0] === end }

  function react(state) {
    if (state.branches.some(ended)) {
      realize(state.promise, state.result)
      state.result = reduced(state.result)
    } else if (state.branches.every(pending)) {
      var zipped = state.branches.map(shift)
      state.result = state.next(state.result, zipped)
      realize(state.pending.shift(), state.result)
    }

    if (is(state.result, reduced))
      realize(state.promise, state.result.value)
  }

  return function zip() {
    var sources = slice(arguments)

    return reducible(function(next, start) {
      var state = {
        pending: [],
        promise: defer(),
        result: start,
        value: defer(),
        next: next,
        branches: sources.map(function(source) {
          return { source: source, queued: [], pending: [] }
        })
      }

      state.branches.forEach(function(branch) {
        var index = 0
        var result = reduce(function(_, value) {
          var pending = state.pending
          var result = pending[index] || (pending[index] = defer())
          index ++
          branch.queued.push(value)
          react(state)
          return result
        }, branch.source)

        go(function() {
          branch.queued.push(end)
          react(state)
        }, result)
      })

      return go(identity, state.promise)
    })
  }
}
exports.zip = zip


