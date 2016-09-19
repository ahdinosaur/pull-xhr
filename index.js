var defined = require('defined')
var extend = require('xtend')
var Buffer = require('buffer').Buffer
var window = require('global/window')
var parseHeaders = require('parse-headers')
var pull = require('pull-stream/pull')
var pullOnce = require('pull-stream/sources/once')
var pullMap = require('pull-stream/throughs/map')
var pullThrough = require('pull-stream/throughs/through')
var pullCollect = require('pull-stream/sinks/collect')
var pullDefer = require('pull-defer')
var pullJson = require('pull-json-doubleline')
var pullPeek = require('pull-peek')

var jsonStreamType = 'application/json; boundary=NLNL'
/*

IDEA: stream out progress events

for async return progress stream

for source or sink return progress stream mixed with other stream

*/

var Xhr = module.exports = {
  async: async,
  source: source,
  sink: sink,
  XMLHttpRequest: window.XMLHttpRequest
}

function source (options, cb) {
  var defer = pullDefer.source()
  var isJsonStream = options.responseType === 'json'
  if (isJsonStream) {
    options.headers = defined(options.headers, {})
    options.headers['accept'] = defined(options.headers['accept'], jsonStreamType)
    options = extend(options, { responseType: 'text' })
  }
  async(options, function (err, body, resp) {
    if (err) return defer.abort(err)
    var stream = pullOnce(body)
    if (isJsonStream) {
      stream = pullJson(stream)
    }
    defer.resolve(stream)
    cb && cb(err, resp)
  })
  return defer
}

function sink (options, cb) {
  var serializer = pullDefer.through()
  return pull(
    pullPeek(function (end, chunk) {
      if (Buffer.isBuffer(chunk)) {
        serializer.resolve(pullThrough())
      } else {
        options = extend(options, {
          headers: extend({
            'content-type': jsonStreamType
          }, options.headers)
        })
        serializer.resolve(pullJson.stringify())
      }
    }),
    serializer,
    pullMap(Buffer),
    pullCollect(function (err, chunks) {
      if (err) return cb(err)

      var body = Buffer.concat(chunks).buffer

      async(extend(options, { body: body }), cb)
    })
  )
}


function async (options, cb) {
  options = defined(options, {})
  
  var xhr = defined(options.xhr, null)
  if (!xhr) {
    xhr = new Xhr.XMLHttpRequest()
  }

  var url = xhr.url = defined(options.url)
  var method = xhr.method = defined(options.method, 'GET')
  var responseType = xhr.responseType = defined(options.responseType, 'text')
  var headers = xhr.headers = extend(options.headers)
  var body = defined(options.body, options.data, null)

  if (!body && 'json' in options && method !== 'GET' && method !== 'HEAD') {
    headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
    body = JSON.stringify(options.json, null, 2)
  }

  if (responseType === 'json') {
    headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
  }

  if (typeof options.timeout === 'number') {
    xhr.timeout = options.timeout
  }

  if (typeof options.beforeOpen === 'function') {
    options.beforeOpen(xhr)
  }

  xhr.addEventListener('load', handleSuccess)
  xhr.addEventListener('error', handleError)
  xhr.addEventListener('abort', handleError)
  xhr.addEventListener('timeout', handleError)

  xhr.open(method, url, true, options.username, options.password)

  // has to be after open
  xhr.withCredentials = !!options.withCredentials

  // has to be after open
  for (key in headers) {
    if (headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, headers[key])
    }
  }

  if (typeof options.beforeSend === 'function') {
    options.beforeSend(xhr)
  }

  xhr.send(body)
  
  return xhr

  function handleError (err) {
    if(!(err instanceof Error)){
      var type = err && err.type || 'unknown'
      var message = 'XMLHttpRequest Error: ' + type
      err = new Error(message)
    }

    var response = getResponse()

    cb(err, response.body, response)
  }

  function handleSuccess (ev) {
    var response = getResponse()
    var err 
    if (xhr.status !== 0){
      response.headers = parseHeaders(xhr.getAllResponseHeaders())
    } else {
      err = new Error('XMLHttpRequest Error: internal')
    }
    cb(err, response.body, response)
  }

  function getBody () {
    var body = xhr.response

    if (responseType === 'json') {
      try {
        body = JSON.parse(body)
      } catch (e) {}
    }

    return body
  }

  function getResponse () {
    return {
      body: getBody(),
      statusCode: xhr.status,
      method: method,
      headers: {},
      url: url,
      rawRequest: xhr
    }
  }
}
