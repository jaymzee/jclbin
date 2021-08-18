const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'public/uploads/'});
const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('public'));
app.use(express.static('public/uploads'));

app.get('/', (req, res) => {
  res.send('Usage:\n');
});

app.post('/', upload.single('f'), (req, res) => {
  const { address, port } = server.address();
  const filename = req.file.filename;
  console.log('file uploaded:', filename);
  res.send(`http://${address}:${port}/${filename}\n`);
});

const server = app.listen(5000, () => {
  const { address, port } = server.address();
  console.log(`Example app listening at http://${address}:${port}`);
});
