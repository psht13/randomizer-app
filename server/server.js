const express = require('express');
const { join, extname } = require('path');
const connectToDatabase = require('./db');
const passport = require('passport');
const session = require('express-session');
require('./Passport');
require('dotenv').config();

const { readFile } = require('fs');
const {
  generatePasswords,
  generatePassword,
  randomWord,
  sequence,
  random,
  registration,
  login,
} = require('./apiHandler');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { env } = require('process');

const app = express();
const port = process.env.PORT;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
};

app.use(express.static(join(__dirname, 'public')));

app.use(express.json());

app.use(
  session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post('/generate-passwords', generatePasswords);
app.post('/generate-password', generatePassword);
app.post('/random-word', randomWord);
app.get('/sequence', sequence);
app.get('/random', random);
app.post('/registration', registration);
app.post('/login', login);
app.use('/auth', require('./authRoutes'));
//================================================================

app.get('*', (req, res) => {
  const filePath = join(__dirname, 'public', req.url);
  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.status(404).send('Not Found');
      } else {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.status(200).contentType(contentType).send(data);
    }
  });
});

connectToDatabase();
//===============================================================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
