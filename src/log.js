"use strict";

const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const files = [];
const index = new Map();
const logPath = path.join('public', 'uploads', 'log.json');
(() => {
  if (fs.existsSync(logPath)) {
    const s = fs.readFileSync(logPath, 'utf8').replace(/\n/g, ',');
    for (const f of JSON.parse(`[${s.slice(0, -1)}]`)) {
      f.date = new Date(f.date); // parse string
      files.push(f);
      index.set(fileId(f.sha1), f);
    }
    console.log(`${index.size} files in uploads`);
  }
})();

// return url safe base64 encoded sha1sum of the file contents
async function sha1sum(path) {
  const buf = await fsp.readFile(path);
  return crypto.createHash('sha1').update(buf).digest('base64');
}

function fileId(digest) {
  return digest.slice(0, 4).replace('+', '_').replace('/', '-');
}

// record extra file upload information
// file is the req.file object from express
async function write(file) {
  file.sha1 = await sha1sum(file.path);
  file.date = new Date();
  const id = fileId(file.sha1);
  files.push(file);
  index.set(id, file);
  fsp.appendFile(logPath, JSON.stringify(file) + '\n');
  return id;
}

// retreive file info from the index
function get(id) {
  return index.get(id);
}

function ls() {
  const directory = new Map(files.map(f => [
    f.originalname,
    {
      name: f.originalname,
      id: fileId(f.sha1),
      size: f.size,
      date: f.date
    }
  ]));
  return new Map([...directory].sort());
}

exports.write = write;
exports.get = get;
exports.ls = ls;
