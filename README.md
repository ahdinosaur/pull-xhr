# pull-xhr

[`window.XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) as a (pseudo) [`pull-stream`](https://pull-stream.github.io)

```shell
npm install --save pull-xhr
```

only supports modern browsers and IE 10+

## api

### `Xhr = require('pull-xhr')`

`request` (`req`) is an object with:

- `url`: default `''` - string to remote location to [open](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open)
- `method`: default `'GET'` - string of http method to [open](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open)
- `responseType`: default `'text'` - string of [response type](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseText)
- `headers`: default `{}` - object to [set request header names to values](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader)
- `body`: default `null` - object to [send as request](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send)
- `json`: object to be stringified as json request body
- `beforeOpen`: function `(xhr) => {}` called before [open](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open)
- `beforeSend`: function `(xhr) => {}` called before [send](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send)

`response` (`res`) is an object with:

- `headers`: object from [received response header names to values](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders)
- `body`: object from [response body](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response)
- `statusCode`: number from [response status code](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status)
- `statusMessage`: string from [response status](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/statusText)
- `url`: string to remote location to [open](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open)
- `method`: string of http method to [open](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open)
- `xhr`: [raw XMLHttpRequest instance](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

## `Xhr.async(req, cb(err, res.body, res))`

don't use streams at all. just ask a question and get an answer.

## `Xhr.source(req, cb (err, res)) => source`

use for downloads. the source is the res

if `req.responseType === 'json'` the source will be parsed from [double newline delimited json](https://github.com/dominictarr/pull-json-doubleline).

## `Xhr.sink(req, cb(err, res.body, res)) => sink`

use for uploads. the sink is the req.

if the first chunk in the source to the sink is not a [Buffer](https://github.com/feross/buffer), the source will be stringified to [double newline delimited json](https://github.com/dominictarr/pull-json-doubleline).

then everything is [concat](https://nodejs.org/api/buffer.html#buffer_class_method_buffer_concat_list_totallength) and sent as an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer).

## license

The Apache License

Copyright &copy; 2016 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
