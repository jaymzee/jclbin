"use strict";

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const files = []
const index = new Map();
const logFilename = path.join('public', 'uploads', 'log.json');
(() => {
  if (fs.existsSync(logFilename)) {
    const s = fs.readFileSync(logFilename).toString().replace(/\n/g, ',');
    for (const f of JSON.parse(`[${s.slice(0, -1)}]`)) {
      f.date = new Date(f.date) // parse string
      files.push(f)
      index.set(shorten(f.digest), f);
    }
    console.log(`${index.size} files in uploads`);
  }
})();

// return url safe base64 encoded md5sum of the file contents
function digest(path) {
  const buf = fs.readFileSync(path);
  const md5sum = crypto.createHash('md5').update(buf).digest('base64');
  return md5sum.replace('/', '-');
}

function shorten(digest) {
  return digest.slice(0, 7);
}

// record extra file upload information
// file is the req.file object from express
function write(file) {
  file.digest = digest(file.path);
  file.date = new Date()
  const id = shorten(file.digest);
  files.push(file);
  index.set(id, file)
  fs.appendFileSync(logFilename, JSON.stringify(file) + '\n');
  return id;
}

// retreive file info from the index
function get(id) {
  return index.get(id);
}

function ls() {
  const dir = new Map(files.map(f => [
    f.originalname,
    {
      name: f.originalname,
      tag: shorten(f.digest),
      size: f.size,
      date: f.date
    }
  ]));
  return dir;
}

exports.write = write;
exports.get = get;
exports.ls = ls;
