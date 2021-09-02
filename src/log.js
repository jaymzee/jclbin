import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const files = [];
const index = new Map();
const logPath = path.join('public', 'uploads', 'log.json');

function fileId(digest) {
  return digest.slice(0, 4).replace('+', '_').replace('/', '-');
}

// initialize module, populate files and index
// returns number of files
function init() {
  if (fs.existsSync(logPath)) {
    const s = fs.readFileSync(logPath, 'utf8').replace(/\n/g, ',');
    for (const f of JSON.parse(`[${s.slice(0, -1)}]`)) {
      f.date = new Date(f.date); // parse string
      files.push(f);
      index.set(fileId(f.sha1), f);
    }
  }
  return index.size;
}

// return url safe base64 encoded sha1sum of the file contents
async function sha1sum(filename) {
  const buf = await fs.promises.readFile(filename);
  return crypto.createHash('sha1').update(buf).digest('base64');
}

// record extra file upload information
// file is the req.file object from express
async function write(file) {
  file.sha1 = await sha1sum(file.path);
  file.date = new Date();
  const id = fileId(file.sha1);
  files.push(file);
  index.set(id, file);
  fs.promises.appendFile(logPath, `${JSON.stringify(file)}\n`);
  return id;
}

// retreive file info from the index
function get(id) {
  return index.get(id);
}

function ls() {
  const directory = new Map(files.map((f) => [
    f.originalname,
    {
      name: f.originalname,
      id: fileId(f.sha1),
      size: f.size,
      date: f.date,
    },
  ]));
  return new Map([...directory].sort());
}

export default {
  init,
  write,
  get,
  ls,
};
