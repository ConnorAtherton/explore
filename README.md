Walks recursively down the file tree starting from the current directory executing functions on arbitrary file types.

### example

```js
function log(file) { console.log(file) }

// print the path of json or ruby files
explore("json|rb", log);
```

It can also accept an array of callbacks and a starting directory

```js
explore(fileTypes, callbacks, startingPath, errCallback)
```

- fileTypes **string**
- callbacks **function or array of functions**
- startingPath **string (absolute)**
- errCallback **function where first arg is error**
