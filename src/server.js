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
const fs = require('fs');
const iface = require('./if');
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const protocol = 'http';
const port = 5000;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('public'));
app.use(express.static('public/uploads'));

app.get('/', (req, res) => {
  res.contentType('text/plain');
  res.send(manual);
});

app.post('/', upload.single('f'), (req, res) => {
  const filename = req.file.filename;
  const url = iface.serverUrl(server, protocol, true);
  res.send(`${url}/${filename}\n`);
  console.log('file uploaded:', filename);
  fs.appendFileSync('public/uploads/file.log', JSON.stringify(req.file) + '\n');
});

const server = app.listen(port, () => {
  for (const [key, value] of Object.entries(iface.enumerate(false))) {
    console.log(`listening on [${key}] http://${value[0]}:${port}`);
  }
});

