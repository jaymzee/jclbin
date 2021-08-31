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
const manpage = fs.readFileSync(path.join(__dirname, 'manpage.txt'), 'utf-8')
const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf-8')
const protocol = 'http';
const port = parseInt(process.argv.slice(-1)[0]) || 5000
const agentPrefersText = /curl|PowerShell|hjdicks/

function pad(num, n, c) {
  return num.toString().padStart(n, c)
}

function help(req, res) {
  res.contentType('text/plain');
  res.send(manpage);
}

// man page, help, usage
app.get('/help', help);
app.get('/', (req, res) => {
  const user_agent = req.headers['user-agent']
  if (agentPrefersText.test(user_agent)) {
    help(req, res)
  } else {
    const html = layout.replace('{BODY}', manpage);
    res.contentType('text/html');
    res.send(html);
  }
});

app.get('/ls', (req, res) => {
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

