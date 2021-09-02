'use strict'

const ip = require('./ip');
const log = require('./log');
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const multer = require('multer');
const path = require('path');
const process = require('process');

const app = express();
const root = 'public';
const static_ = path.join(root, 'static');
const upload = multer({dest: path.join(root, 'uploads')});
const layout = fs.readFileSync(path.join(static_, 'layout.html'), 'utf8');
const manPage = fs.readFileSync(path.join(static_, 'manpage.txt'), 'utf8');
const protocol = 'http';
const port = parseInt(process.argv.slice(-1)[0]) || 5000;
const agentPrefersText = /curl|PowerShell|hjdicks/;

// pad an unsigned number with n spaces or zeros
function pad(num, n, c) {
  return num.toString().padStart(n, c);
}

// man page always text/plain
function getManPage(req, res) {
  res.contentType('text/plain');
  res.send(manPage);
}

// favicon
app.get('/favicon.ico', async (req, res) => {
  res.contentType('image/png');
  res.send(await fsp.readFile(path.join('public', 'static', 'favicon.ico')));
});

// upload form
app.get('/f/upload', async (req, res) => {
  const s = await fsp.readFile(path.join('public', 'static', 'upload.html'));
  res.send(layout.replace('{BODY}', `${s}`));
});

// list uploads
app.get('/sh/ls', (req, res) => {
  function df(d) {
    const mo = month.format(d);
    const da = pad(d.getDate(), 2, ' ');
    const hr = pad(d.getHours(), 2, '0');
    const mn = pad(d.getMinutes(), 2, '0');
    return `${mo} ${da} ${hr}:${mn}`;
  }
  const month = new Intl.DateTimeFormat('en', { month: 'short' });
  const dir = [...log.ls().values()];
  const s = dir.map(f => `${f.id} ${pad(f.size, 9, ' ')} ` +
                         `${df(f.date)} ${f.name}`).join('\n');
  res.contentType('text/plain');
  res.send(s + '\n');
});

// man page (default route)
app.get('/sh/man', getManPage);

// retreive uploaded file
app.get('/:id', (req, res) => {
  const remote = req.socket.remoteAddress;
  const id = req.params.id;
  const file = log.get(id);
  if (!file) {
    res.status(404).send("bad id " + id);
    return;
  }
  res.contentType(file.mimetype);
  res.set('Content-Disposition', `attachment; filename="${file.originalname}"`);
  console.log('file dnld:', file.sha1, file.originalname, remote);
  res.sendFile(file.path, { root: process.cwd() });
});

// man page
app.get('/', (req, res) => {
  if (agentPrefersText.test(req.headers['user-agent'])) {
    getManPage(req, res);
  } else {
    res.send(layout.replace('{BODY}', `<pre>${manPage}</pre>`));
  }
});

// post a file
app.post('/', upload.single('f'), async (req, res) => {
  if (!req.file) {
    res.sendStatus(400);
    return;
  }
  const remote = req.socket.remoteAddress;
  const file = Object.assign({remote}, req.file);
  const baseUrl = `${protocol}://${req.headers.host}`;
  const tag = await log.write(file);
  console.log('file upld:', file.sha1, file.originalname, remote);
  res.send(`${baseUrl}/${tag}\n`);
});

const server = app.listen(port, () => {
  for (const [ifname, addresses] of Object.entries(ip.enumerateIfs(false))) {
    console.log(`listening on [${ifname}] http://${addresses[0]}:${port}`);
  }
});

