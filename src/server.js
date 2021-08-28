'use strict'
const manpage = `
<html>
<head>
  <title>jclbin</title>
  <link rel="icon" href="data:,">
</head>
<body>
<pre>
jclbin(1)                        JCLBIN                        jclbin(1)

NAME
    jclbin: command line pastebin:

SYNOPSIS
    curl -F 'jclbin=@filename' http://example.com

DESCRIPTION
    A simple http pastebin server like ix.io, clbin.com, or sprunge.us
    It currently does not create nice short urls or support curl's
    redirect from stdin "f=<-" but i'll get around to it.

EXAMPLE
    $ curl -F 'f=@filename' https://example.com
    http://example.com/2c42f4fcbd451a05bc904b06eefcc2ee


SEE ALSO
    http://ix.io
    http://clbin.com
    http://sprunge.us
</pre>
</body>
</html>
`
const ip = require('./ip');
const log = require('./log');
const express = require('express');
const multer = require('multer');
const path = require('path');
const process = require('process');

const upload = multer({dest: path.join('public', 'uploads')});
const protocol = 'http';
const port = 5000;
const app = express();

// man page, help, usage
app.get('/', (req, res) => {
  res.contentType('text/html');
  res.send(manpage.replaceAll(/\n/g, '\r\n'));
});

// retreive file
app.get('/:id', (req, res) => {
  const remoteAddress = req.connection.remoteAddress;
  const file = log.get(req.params.id);
  if (file) {
    console.log('file dnld:', file.digest, file.originalname, remoteAddress);
    res.sendFile(file.path, { root: process.cwd() });
  } else {
    res.sendStatus(404);
  }
});

// post a file
app.post('/', upload.single('f'), (req, res) => {
  const remoteAddress = req.connection.remoteAddress;
  const file = Object.assign({remoteAddress}, req.file);
  const url = ip.serverUrl(server, protocol, true);
  const tag = log.write(file);
  console.log('file upld:', file.digest, file.originalname, remoteAddress);
  res.send(`${url}/${tag}\r\n`);
});

const server = app.listen(port, () => {
  for (const [key, value] of Object.entries(ip.enumerateIfs(false))) {
    console.log(`listening on [${key}] http://${value[0]}:${port}`);
  }
});

