var pull = require('pull-stream')
var pullDefer = require('pull-defer')
var pullJson = require('pull-json')
var xhr = require('xhr')

// url
// body
// requestType
// responseType

var jsonType = 'application/json'
var dlSuffix = '; boundary=NLNL'

module.exports = {
  async: async,
  source: source,
  sink: sink
}

function source (options) {
  var xhrOptions = setup(options)
  var defer = pullDefer.source()
  if (subMatch(jsonType, resp.headers['content-type'])) {
    var body = JSON.stringify(options.json)
    stream = pullJson(stream)
  }
  xhr(xhrOptions, function (err, resp, body) {
    var stream = pull.once(body)
    if (subMatch(jsonType, resp.headers['content-type'])) {
      stream = pullJson(stream)
    }
    defer.resolve(stream)
  })
  return defer
}

function sink (options) {
  options = setup(options)

}

function async (options, cb) {
  // if cb is not provided, turn into a continuable.
  if (!cb) return function (cb) { async(opts, cb) }

  xhr(options, cb)
}

function setup (type, options) {
  var json = options.json
  var headers = options.headers

  if (options.json) {
    headers = setJsonHeaders({
      json: json,
      type: type
    }, headers)
  }

  return extend(options, {
    headers: headers,
    json: null
  })
}

function setJsonHeaders (options, headers) {
  var json = options.json
  var type = options.type

  if (typeof json === 'boolean') {
    json = { source: json, sink: json }
  }

  if (json.source) {
    headers['accept'] = jsonType
    if (type === 'source') headers['accept'] += dlSuffix
  }
  if (json.sink) {
    headers['content-type'] = jsonType
    if (type === 'sink') headers['content-type'] += dlSuffix
  }

  return headers
}

function subMatch (match, value) {
  return value.substring(0, match.length) === match
}
