"use strict";

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const logFile = path.join('public', 'uploads', 'log.json');

let files = []   // in memory copy of file.log
const index = new Map();
init();

function init() {
  if (fs.existsSync(logFile)) {
    const buf = fs.readFileSync(logFile);
    let s = buf.toString();
    s = s.replace(/\n/g, ',');  // replace newlines with comma
    s = `[${s.slice(0, -1)}]`;  // remove last comma and wrap in []
    files = JSON.parse(s);
    for (const file of files) {
      if (file.digest) {
        index.set(shorten(file.digest), file);
      }
    }
    console.log(`${index.size} files in uploads`);
  }
}

function digest(path) {
  const buf = fs.readFileSync(path);
  return crypto.createHash('md5').update(buf).digest('base64');
}

function shorten(digest) {
  return digest.slice(0, 7);
}

// record extra file upload information
// file is the req.file object from express
function write(file) {
  file.digest = digest(file.path);
  const id = shorten(file.digest);
  files.push(file);
  index.set(id, file)
  fs.appendFileSync(logFile, JSON.stringify(file) + '\n');
  return id;
}

function get(id) {
  return index.get(id);
}

exports.write = write;
exports.get = get;
