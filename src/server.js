const mynet = require('./mynet');
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('public'));
app.use(express.static('public/uploads'));

man_page = `
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
`;

const serverUrl = mynet.serverUrl;

app.get('/', (req, res) => {
  res.send(man_page);
});

app.post('/', upload.single('f'), (req, res) => {
  const filename = req.file.filename;
  res.send(`${serverUrl(server)}/${filename}\n`);
  console.log('file uploaded:', filename);
});

const server = app.listen(5000, () => {
  console.log(`jclbin listening at ${serverUrl(server)}`);
});

const nets = mynet.getInterfaces();
console.log('local adddresses:');
console.log(nets);
