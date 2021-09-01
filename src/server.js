'use strict'

const ip = require('./ip');
const log = require('./log');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const process = require('process');

const app = express();
const upload = multer({dest: path.join('public', 'uploads')});
const layout = fs.readFileSync(path.join('public', 'layout.html'), 'utf-8');
const protocol = 'http';
const port = parseInt(process.argv.slice(-1)[0]) || 5000;
const agentPrefersText = /curl|PowerShell|hjdicks/;

function pad(num, n, c) {
  return num.toString().padStart(n, c)
}

// render man page as text/plain
function manPage(req, res) {
  const page = fs.readFileSync(path.join('public', 'manpage.txt'), 'utf-8');
  res.contentType('text/plain');
  res.send(page);
}

// default route shows the man page
app.get('/sh/man', manPage);
app.get('/', (req, res) => {
  if (agentPrefersText.test(req.headers['user-agent'])) {
    manPage(req, res)
  } else {
    const body = fs.readFileSync(path.join('public', 'manpage.txt'), 'utf-8');
    res.send(layout.replace('{BODY}', `<pre>${body}</pre>`));
  }
});

// post a file
app.post('/', upload.single('f'), (req, res) => {
  if (!req.file) {
    res.sendStatus(400);
    return;
  }
  const remote = req.connection.remoteAddress;
  const file = Object.assign({remote}, req.file);
  const url = ip.serverUrl(server, protocol, true);
  const tag = log.write(file);
  console.log('file upld:', file.digest, file.originalname, remote);
  res.send(`${url}/${tag}\r\n`);
});

// retreive uploaded file
app.get('/:id', (req, res) => {
  const remote = req.connection.remoteAddress;
  const id = req.params.id;
  const file = log.get(id);
  if (!file) {
    res.status(404).send("bad id " + id);
    return;
  }
  console.log('file dnld:', file.digest, file.originalname, remote);
  res.sendFile(file.path, { root: process.cwd() });
});

app.get('/sh/ls', (req, res) => {
  function df(d) {
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    const hr = pad(d.getHours(), 2, '0')
    const mn = pad(d.getMinutes(), 2, '0')
    return `${mo} ${da} ${hr}:${mn}`
  }
  const dir = [...log.ls().values()];
  const a = dir.map(f => `${f.tag} ${pad(f.size, 10, ' ')} ` +
                         `${df(f.date)} ${f.name}`);
  res.contentType('text/plain');
  res.send(a.join('\n') + '\n');
});

// upload form
app.get('/f/submit', (req, res) => {
  const form = fs.readFileSync(path.join('public', 'submit.html'), 'utf-8');
  res.send(layout.replace('{BODY}', `${form}`));
});

app.get('/i/favicon.png', (req, res) => {
  res.send(fs.readFileSync(path.join('public', 'favicon.png')));
});

const server = app.listen(port, () => {
  for (const [ifname, addresses] of Object.entries(ip.enumerateIfs(false))) {
    console.log(`listening on [${ifname}] http://${addresses[0]}:${port}`);
  }
});

