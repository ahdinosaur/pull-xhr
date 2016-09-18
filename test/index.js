const test = require('tape')
const pull = require('pull-stream')

const xhr = require('../')

test('constructs and calls callback without throwing', function (assert) {
  xhr.async({}, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.ok(true, 'got here')
    assert.end()
  })
})

test('[func] Can GET a url (cross-domain)', function (assert) {
  xhr.async({
    uri: 'http://www.mocky.io/v2/55a02cb72651260b1a94f024',
    useXDR: true
  }, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.equal(resp.statusCode, 200)
    assert.equal(typeof resp.rawRequest, 'object')
    assert.notEqual(resp.body.length, 0)
    assert.equal(resp.body, '{"a":1}')
    assert.notEqual(body.length, 0)
    assert.end()
  })
})

test("[func] Returns http error responses like npm's request (cross-domain)", function (assert) {
  if (!window.XDomainRequest) {
    xhr.async({
      uri: 'http://www.mocky.io/v2/55a02d63265126221a94f025',
      useXDR: true
    }, function (err, body, resp) {
      assert.ifError(err, 'no err')
      assert.equal(resp.statusCode, 404)
      assert.equal(typeof resp.rawRequest, 'object')
      assert.end()
    })
  } else {
    assert.end()
  }
})

test('[func] Returns a falsy body for 204 responses', function (assert) {
  xhr.async({
    uri: '/mock/no-content'
  }, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.notOk(body, 'body should be falsey')
    assert.equal(resp.statusCode, 204)
    assert.end()
  })
})

test('[func] Times out to an error ', function (assert) {
  xhr.async({
    timeout: 1,
    uri: '/mock/timeout'
  }, function (err, body, resp) {
    assert.ok(err instanceof Error, 'should return error')
    assert.equal(err.message, 'XMLHttpRequest timeout')
    assert.equal(err.code, 'ETIMEDOUT')
    assert.equal(resp.statusCode, 0)
    assert.end()
  })
})

test('handles errorFunc call with no arguments provided', function (assert) {
  var req = xhr.async({}, function (err) {
    assert.ok(err instanceof Error, 'callback should get an error')
    assert.equal(err.message, 'Unknown XMLHttpRequest Error', 'error message incorrect')
  })
  assert.doesNotThrow(function () {
    req.onerror()
  }, 'should not throw when error handler called without arguments')
  assert.end()
})

test('handles source stream', function (assert) {
  var source = xhr.source({
    url: '/mock/source',
    responseType: 'json'
  })

  assert.plan(2)
  var i = 0
  pull(
    source,
    pull.drain(function (obj) {
      if (i === 0) {
        assert.deepEqual(obj, { a: 'b' })
      } else if (i === 1) {
        assert.deepEqual(obj, { c: 'd' })
      }
      i++
    })
  )
})

test('handles binary source stream', function (assert) {
  var source = xhr.source({
    url: '/mock/source-binary',
    responseType: 'arraybuffer'
  })

  pull(
    source,
    pull.drain(function (arraybuffer) {
      const actual = Buffer(arraybuffer)
      const expected = Buffer(['a', 's', 'd', 'f', 'j', 'k', 'l', ';'])

      assert.ok(actual.equals(expected))
      assert.end()
    })
  )
})

test('handles sink stream', function (assert) {
  var sink = xhr.sink({
    url: '/mock/sink',
    responseType: 'json'
  }, function (err, result) {
    assert.ifError(err)
    assert.deepEqual(result, { value: 'ok' })
    assert.end()
  })

  pull(
    pull.values(['asdf', 'jkl;']),
    sink
  )
})

test('handles binary sink stream', function (assert) {
  var sink = xhr.sink({
    url: '/mock/sink',
    responseType: 'json'
  }, function (err, result) {
    assert.ifError(err)
    assert.deepEqual(result, { value: 'ok' })
    assert.end()
  })

  pull(
    pull.values(['asdf', 'jkl;']),
    sink
  )
})
