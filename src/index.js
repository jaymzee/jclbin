const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('public'));
app.use(express.static('public/uploads'));

const serverUrl = server => {
  let { address, family, port } = server.address()
  if (family == 'IPv6' && address.includes(':')) {
    address = `[${address}]`
  }
  return `http://${address}:${port}`
};

app.get('/', (req, res) => {
  res.send('Usage:\n');
});

app.post('/', upload.single('f'), (req, res) => {
  const filename = req.file.filename;
  res.send(`${serverUrl(server)}/${filename}\n`);
  console.log('file uploaded:', filename);
});

const server = app.listen(5000, () => {
  console.log(`jclbin listening at ${serverUrl(server)}`);
});

