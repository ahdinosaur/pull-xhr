var pull = require('pull-stream')
var pullDefer = require('pull-defer')
var pullJson = require('pull-json-doubleline')
var pullPeek = require('pull-peek')
var xhr = require('xhr')

var jsonStreamType = 'application/json; boundary=NLNL'
/*

IDEA: stream out progress events

for async return progress stream

for source or sink return progress stream mixed with other stream

*/

module.exports = {
  async: async,
  source: source,
  sink: sink
}

function source (options, cb) {
  var defer = pullDefer.source()
  if (options.responseType === 'json') {
    var isJsonStream = true
    options.headers['accept'] = jsonStreamType
    delete options.responseType
  }
  async(options, function (err, body, resp) {
    if (err) return defer.abort(err)
    var stream = pull.once(body)
    if (isJsonStream) {
      stream = pullJson(stream)
    }
    defer.resolve(stream)
    cb(err, body, resp)
  })
  return defer
}

function sink (options, cb) {
  if (options.responseType === 'json') {
    options.headers['accept'] = jsonStreamType
    delete options.responseType
  }
  var serializer = pullDefer.through()
  return pull(
    pullPeek(function (end, chunk) {
      if (Buffer.isBuffer(chunk)) {
        serializer.resolve(pull.through())
      } else {
        serializer.resolve(pullJson.stringify())
      }
    }),
    serializer,
    pull.collect(function (err, chunks) {
      if (err) return cb(err)
      options.body = Buffer.concat(chunks).buffer

      async(options, cb)
    })
  )
}

function async (options, cb) {
  // if cb is not provided, turn into a continuable.
  if (!cb) return function (cb) { async(options, cb) }

  return xhr(options, function (err, resp, body) {
    if (options.responseType === 'json' && typeof body === 'string') {
      // IE doesn't parse responses as JSON without the json attribute,
      // even with responseType: 'json'.
      // See https://github.com/Raynos/xhr/issues/123
      try {
        body = JSON.parse(body)
      } catch (e) {
        // not parseable anyway, don't worry about it
      }
    }
    cb(err, body, resp)
  })
}
