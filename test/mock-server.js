const pull = require('pull-stream')
const pullJson = require('pull-json-doubleline')
const toPull = require('stream-to-pull-stream')
const Buffer = require('buffer').Buffer

module.exports = function handler (req, res) {
  console.log('mock:', req.method, req.url)
  if (req.url === '/mock/200ok') {
    res.statusCode = 200
    res.end('')
  } else if (req.url === '/mock/no-content') {
    res.statusCode = 204
    res.end('')
  } else if (req.url === '/mock/timeout') {
    setTimeout(function () {
      res.statusCode = 200
      res.end()
    }, 100)
  } else if (req.url === '/mock/source') {
    pull(
      pull.values([
        { a: 'b' },
        { c: 'd' }
      ]),
      pullJson.stringify(),
      toPull.sink(res)
    )
  } else if (req.url === '/mock/source-binary') {
    pull(
      pull.values([
        Buffer(['a', 's', 'd', 'f']),
        Buffer(['j', 'k', 'l', ';'])
      ]),
      toPull.sink(res)
    )
  } else if (req.url === '/mock/sink') {
    var i = 0
    pull(
      toPull.source(req),
      pullJson.parse(),
      pull.asyncMap(function (chunk, cb) {
        i++
        if (
          (i === 1 && chunk === 'asdf') ||
          (i === 2 && chunk === 'jkl;')
        ) cb(null, chunk)
        else cb(new Error('unexpected request'))
      }),
      pull.drain(null, function (err) {
        if (err || i !== 2) res.end('{ "value": "notOk" }')
        else res.end('{ "value": "ok" }')
      })
    )
  } else if (req.url === '/mock/sink-binary') {
    var seen = false
    pull(
      toPull.source(req),
      pull.asyncMap(function (chunk, cb) {
        if (chunk.toString() === 'asdfjkl;') {
          seen = true
          cb(null, chunk)
        } else cb(new Error('unexpected request'))
      }),
      pull.drain(null, function (err) {
        if (err || !seen) res.end('{ "value": "notOk" }')
        else res.end('{ "value": "ok" }')
      })
    )
  }
}
