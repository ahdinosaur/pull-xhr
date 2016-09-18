const pull = require('pull-stream')
const pullJson = require('pull-json-doubleline')
const toPull = require('stream-to-pull-stream')

module.exports = function handler (req, res) {
  console.log('mock:', req.url)
  if (req.url === '/mock/200ok') {
    res.statusCode = 200
    res.end('')
  } else if (req.url === '/mock/no-content') {
    res.statusCode = 204
    res.end()
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
      pull.drain(
        (s) => res.write(s),
        (err) => res.end(err)
      )
    )
  } else if (req.url === '/mock/source-binary') {
    pull(
      pull.values([
        new Buffer(['a', 's', 'd', 'f']),
        new Buffer(['j', 'k', 'l', ';'])
      ]),
      toPull.sink(res)
    )
  } else if (req.url === '/mock/sink') {
    res.setHeader('content-type', 'application/json')
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
        if (err) res.end(err)
        else res.end('{ "value": "ok" }')
      })
    )
  }
}
