const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const PORT = 5151;

const avatars = [];

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendStatus(404);
});

app.use((req, res, next) => {
  if (req.header('X-Api-Key') === 'kotka') {
    next();
  } else {
    res.sendStatus(401);
  }
});

const upload = multer({ dest: 'uploads/' });

app.post(
  '/avatar/upload',
  upload.fields([{ name: 'avatar' }, { name: 'petId' }]),
  (req, res) => {
    const { avatar, petId } = req.files;

    if (!avatar) {
      res.status(400);
      res.send("'avatar' part not found.");
      return;
    }

    if (!petId) {
      res.status(400);
      res.send("'petId' part not found.");
      return;
    }

    avatars.unshift({
      petId: Number(fs.readFileSync(petId[0].path).toString()),
      mimetype: avatar[0].mimetype,
      path: avatar[0].path,
    });

    res.json({ message: 'Successfully uploaded file' });
  }
);

app.get('/avatar/download/:petId', (req, res) => {
  const petId = Number(req.params.petId);
  const avatar = avatars.find((x) => x.petId === petId);
  if (!avatar) {
    res.status(400);
    res.send(`No avatar found for petId=${petId}`);
  }

  res.setHeader('Content-Type', avatar.mimetype);
  res.sendFile(avatar.path, { root: __dirname });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}.`);
});
