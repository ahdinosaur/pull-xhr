const test = require('tape')

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

test('[func] Calls the callback at most once even if error is thrown issue #127', function (assert) {
  // double call happened in chrome
  var count = 0
  setTimeout(function () {
    assert.ok(count <= 1, 'expected at most one call')
    assert.end()
  }, 100)
  try {
    xhr.async({
      uri: 'instanterror://foo'
    }, function (err, body, resp) {
      assert.ok(err, 'err')
      count++
      throw Error('dummy error')
    })
  } catch (e) {}
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
