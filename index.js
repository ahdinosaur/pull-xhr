var defined = require('defined')
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
  var isJsonStream = options.responseType === 'json'
  if (isJsonStream) {
    options.headers = defined(options.headers, {})
    options.headers['accept'] = defined(options.headers['accept'], jsonStreamType)
    delete options.responseType
  }
  async(options, function (err, body, resp) {
    if (err) return defer.abort(err)
    var stream = pull.once(body)
    if (isJsonStream) {
      stream = pullJson(stream)
    }
    defer.resolve(stream)
    cb && cb(err, body, resp)
  })
  return defer
}

function sink (options, cb) {
  var serializer = pullDefer.through()
  return pull(
    pullPeek(function (end, chunk) {
      if (Buffer.isBuffer(chunk)) {
        serializer.resolve(pull.through())
      } else {
        options.headers = defined(options.headers, {})
        options.headers['content-type'] = defined(options.headers['content-type'], jsonStreamType)
        serializer.resolve(pullJson.stringify())
      }
    }),
    serializer,
    pull.collect(function (err, chunks) {
      if (err) return cb(err)
      options.body = Buffer.concat(chunks.map(Buffer))

      async(options, cb)
    })
  )
}


function async (options, cb) {
  return xhr(options, function (err, resp, body) {
    cb(err, body, resp)
  })
}
