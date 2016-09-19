# pull-xhr

[`window.XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) as a (pseudo) [`pull-stream`](https://pull-stream.github.io)

```shell
npm install --save pull-xhr
```

only supports modern browsers and IE 10+

## api

### `xhr = require('pull-xhr')`

## xhr.async(opts, cb(err, body, resp))

don't use streams at all. just ask a question and get an answer.

## xhr.source(opts, cb (err, resp)) => source

use for downloads. the source is the response.

## xhr.sink(opts, cb(err, body, resp)) => sink

use for uploads. the sink is the request.

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
