'use strict'

const ip = require('./ip');
const log = require('./log');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const process = require('process');

const upload = multer({dest: path.join('public', 'uploads')});
const protocol = 'http';
const port = 5000;
const app = express();
const manpage = fs.readFileSync(path.join(__dirname, 'manpage.txt'), 'utf-8')
const layout = fs.readFileSync(path.join(__dirname, 'layout.html'), 'utf-8')
const agentIsTextRe = /curl|PowerShell|hjdicks/

// man page, help, usage
app.get('/', (req, res) => {
  const user_agent = req.headers['user-agent']
  if (agentIsTextRe.test(user_agent)) {
    res.contentType('text/plain');
    res.send(manpage);
  } else {
    const html = layout.replace('{BODY}', manpage);
    res.contentType('text/html');
    res.send(html);
  }
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

