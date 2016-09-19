const test = require('tape')
const pull = require('pull-stream')
const Buffer = require('buffer').Buffer

const xhr = require('../')

test('constructs and calls callback without throwing', function (assert) {
  xhr.async({}, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.ok(true, 'got here')
    assert.end()
  })
})

test('can GET a url (cross-domain)', function (assert) {
  xhr.async({
    url: 'http://www.mocky.io/v2/55a02cb72651260b1a94f024'
  }, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.equal(resp.statusCode, 200)
    assert.equal(resp.statusMessage, 'OK')
    assert.equal(typeof resp.xhr, 'object')
    assert.notEqual(resp.body.length, 0)
    assert.equal(resp.body, '{"a":1}')
    assert.notEqual(body.length, 0)
    assert.end()
  })
})

test("returns http error responses like npm's request (cross-domain)", function (assert) {
  xhr.async({
    url: 'http://www.mocky.io/v2/55a02d63265126221a94f025'
  }, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.equal(resp.statusCode, 404)
    assert.equal(resp.statusMessage, 'Not Found')
    assert.equal(typeof resp.xhr, 'object')
    assert.end()
  })
})

test('returns a falsy body for 204 responses', function (assert) {
  xhr.async({
    url: '/mock/no-content'
  }, function (err, body, resp) {
    assert.ifError(err, 'no err')
    assert.notOk(body, 'body should be falsey')
    assert.equal(resp.statusCode, 204)
    assert.equal(resp.statusMessage, 'No Content')
    assert.equal(typeof resp.xhr, 'object')
    assert.end()
  })
})

test('times out to an error ', function (assert) {
  xhr.async({
    timeout: 1,
    url: '/mock/timeout'
  }, function (err, body, resp) {
    assert.ok(err instanceof Error, 'should return error')
    assert.equal(err.message, 'XMLHttpRequest Error: timeout')
    assert.equal(resp.statusCode, 0)
    assert.equal(resp.statusMessage, '')
    assert.equal(typeof resp.xhr, 'object')
    assert.end()
  })
})

test('handles error', function (assert) {
  xhr.async({
    url: 'http://nothing'
  }, function (err, body, resp) {
    assert.ok(err instanceof Error, 'callback should get an error')
    assert.equal(err.message, 'XMLHttpRequest Error: error', 'error message incorrect')
    assert.equal(resp.statusCode, 0)
    assert.equal(resp.statusMessage, '')
    assert.equal(typeof resp.xhr, 'object')
    assert.end()
  })
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
    method: 'POST',
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
    method: 'POST',
    url: '/mock/sink-binary',
    responseType: 'json'
  }, function (err, result) {
    assert.ifError(err)
    assert.deepEqual(result, { value: 'ok' })
    assert.end()
  })

  pull(
    pull.values([
      Buffer('asdf'),
      Buffer('jkl;')
    ]),
    sink
  )
})
