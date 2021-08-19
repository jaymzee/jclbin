manual = `
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
`
const process = require('process');
const log = require('./log');
const ip = require('./ip');
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const protocol = 'http';
const port = 5000;
const app = express();

//app.use(express.urlencoded({extended: true}));
//app.use('/static', express.static('public'));
//app.use(express.static('public/uploads'));

app.get('/', (req, res) => {
  res.contentType('text/plain');
  res.send(manual);
});

app.get('/:id', (req, res) => {
  const remoteAddress = req.connection.remoteAddress;
  const file = log.get(req.params.id);
  console.log('file download:', file.digest, file.originalname, remoteAddress);
  res.sendFile(file.path, { root: process.cwd() });
});

app.post('/', upload.single('f'), (req, res) => {
  const remoteAddress = req.connection.remoteAddress;
  const file = Object.assign({remoteAddress}, req.file);
  const filename = req.file.filename;
  const url = ip.serverUrl(server, protocol, true);
  console.log('file upload:', filename, file.originalname, remoteAddress);
  const tag = log.write(file);
  res.send(`${url}/${tag}\n`);
});

const server = app.listen(port, () => {
  for (const [key, value] of Object.entries(ip.enumerateIfs(false))) {
    console.log(`listening on [${key}] http://${value[0]}:${port}`);
  }
});

