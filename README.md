a simple http pastebin server

start the server with `npm start` or:
```
node src/server.js
```

upload files with curl
```
$ curl -F 'f=@filename' http://example.com
http://example.com/2c42f4fcbd451a05bc904b06eefcc2ee
```

download files with curl
```
$ curl http://example.com/2c42f4fcbd451a05bc904b06eefcc2ee
[your file contents]
$ curl -o filename http://example.com/2c42f4fcbd451a05bc904b06eefcc2ee
```
