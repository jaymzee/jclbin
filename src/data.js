const fs = require('fs');
const path = 'public/uploads/log.json'
let rows = []   // in memory copy of file.log

if (fs.existsSync(path)) {
  const buf = fs.readFileSync(path);
  let s = buf.toString();
  s = s.replace(/\n/g, ',');  // replace newlines with comma
  s = `[${s.slice(0, -1)}]`;  // remove last comma and wrap in []
  rows = JSON.parse(s);
  console.log(`${rows.length} files in uploads`);
}

// record extra file upload information
// file is the req.file object from express
function logFile(file) {
  rows.push(file);
  fs.appendFileSync('public/uploads/log.json', JSON.stringify(file) + '\n');
}

exports.logFile = logFile;
