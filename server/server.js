/* Imports */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();
app.use(cors({origin: 'http://localhost:5173', credentials: true}));
app.use(express.json());

/* DB */
const pgp = require('pg-promise')();
const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  allowExitOnIdle: true
};
const db = pgp(cn);

/* Multer */
const storage = multer.diskStorage({
  destination: '../client/public',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

/* SESSION */
app.use(session({
  store: new pgSession({
    pgPromise: db,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10*60*1000, secure: false },
}));

/* Autenticar */
const authenticateSession = (req, res, next) => {
  if (req.session.id_author) {
    next();
  } else {
    res.sendStatus(401);
  }
};

/* ROUTES */
app.get('/hello', (req, res) => {
  res.json({ message: "Hola" });
});

app.get('/posts', (req, res) => {
  db.any('SELECT * FROM post')
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

app.get('/posts/:id_post', (req, res) => {
  db.one('SELECT * FROM post WHERE id_post=$1', [req.params.id_post])
    .then((data) => res.json(data))
    .catch((error) => console.log('ERROR:', error));
});

app.post('/posts/new', upload.single('img'), function (req, res) {
  db.none(
    "INSERT INTO post (title, text, image, date, id_author) VALUES($1, $2, $3, NOW(), 1)",
    [req.body.title, req.body.text, '/' + req.file.originalname]
  )
    .then(() => res.send({ message: 'Post agregado correctamente' }))
    .catch((error) => console.log('ERROR: ', error));
});

/* AUTH ENDPOINTS */
app.post('/login', upload.none(), (req, res) => {
  const { username, password } = req.body;
  db.oneOrNone("SELECT * FROM autor WHERE username=$1", [username])
  .then((data) => {
    if (data != null) {
      if (data.password == password) {
        req.session.id_author = data.id_author;
        req.session.save(function (err) {
          if (err) return next(err);
        });
        res.send(req.session);
      } else {
        res.status(401).send('Invalid email/password');
      }
    } else {
      res.status(401).send('Invalid credentials');
    }
  })
  .catch((error) => console.log('ERROR: ', error));
});

app.get('/session-info', (req, res) => {
  res.json(req.session);
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Failed to destroy session');
    }
    res.send('Session destroyed');
  });
});

/* PROTECTED ROUTES */
app.get('/authors/:id_author', authenticateSession, (req, res) => {
  db.one("SELECT *, TO_CHAR(date_of_birth, 'DD/MM/YYYY') as date_of_birth FROM autor WHERE id_author=$1", [req.params.id_author])
  .then((data) => res.json(data))
  .catch((error) => console.log('ERROR: ', error));
});

app.listen(8000, () => {
  console.log('Servidor corriendo en http://localhost:8000');
});