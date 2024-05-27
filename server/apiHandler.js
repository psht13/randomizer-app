const bcrypt = require('bcryptjs');
const connectToDatabase = require('./db');
const jwt = require('jsonwebtoken');
const { secret } = require('./models/ConfigKey');

const generateAuthToken = (id, username) => {
  const payload = {
    id,
    username,
  };
  return jwt.sign(payload, secret, { expiresIn: '24H' });
};

const generatePasswords = (req, res) => {
  const { quantity, length } = req.body;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-+=';
  let passwordSet = [];

  if (isNaN(quantity) || isNaN(length) || quantity <= 0 || length <= 0) {
    res.status(400).json({
      error:
        'Будь ласка, введіть коректні значення для кількості та довжини паролів.',
    });
  } else {
    for (let j = 0; j < quantity; j++) {
      let password = '';
      for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      passwordSet.push(password);
    }
    res.json({ passwordSet: passwordSet });
  }
};

const generatePassword = (req, res) => {
  const { length } = req.body;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-+=';

  if (isNaN(length) || length <= 0) {
    res
      .status(400)
      .json({ error: 'Будь ласка, введіть коректну довжину пароля.' });
  } else {
    let password = '';
    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    res.json({ password: password });
  }
};

const randomWord = (req, res) => {
  const { text } = req.body;
  const words = text.split(/\s+/).filter(word => word.trim() !== '');

  if (words.length === 0) {
    res.status(400).json({ error: 'Будь ласка, введіть текст.' });
  } else {
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];
    res.json({ randomWord: randomWord });
  }
};

const sequence = (req, res) => {
  const quantity = parseInt(req.query.quantity);
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);

  if (isNaN(min) || isNaN(max) || isNaN(quantity)) {
    res.status(400).send('Будь ласка, введіть коректні значення.');
  } else if (min >= max) {
    res.status(400).send('Значення max повинно бути більшим за значення min.');
  } else {
    let result = '';
    for (let i = 0; i < quantity; i++) {
      result += Math.floor(Math.random() * (max - min + 1)) + min + ', ';
    }
    res.send(result);
  }
};

const random = (req, res) => {
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);

  if (isNaN(min) || isNaN(max)) {
    res.status(400).send('Будь ласка, введіть числа.');
  } else if (min >= max) {
    res
      .status(400)
      .send('Мінімальне значення повинно бути менше за максимальне.');
  } else {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    res.send('' + randomNumber);
  }
};

const registration = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const { username, email, password } = req.body;
    // Перевірка на порожні поля
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, Email and Password are required' });
    }

    // Перевірка довжини пароля
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    const candidateU = await usersCollection.findOne({ username });
    const candidateE = await usersCollection.findOne({ email });

    if (candidateU || candidateE) {
      return res.status(400).json({ message: 'Username/Email already exists' });
    }

    const hashPassword = bcrypt.hashSync(password, 4);
    const user = { username, email, password: hashPassword };
    const result = await usersCollection.insertOne(user);

    // Генерація токену
    const token = generateAuthToken(result.insertedId, username);

    return res.json({ message: 'Success', token });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Registration error' });
  }
};

const login = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const { username, password } = req.body;
    const candidateU = await usersCollection.findOne({ username });
    if (!candidateU) {
      return res
        .status(400)
        .json({ message: 'Користувач ${username} не знайдений' });
    }
    const validPassword = bcrypt.compareSync(password, candidateU.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Не правильний пароль' });
    }
    const token = generateAuthToken(candidateU._id, candidateU.username);
    return res.json({ token: token });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: 'Login error' });
  }
};

module.exports = {
  generatePasswords,
  generatePassword,
  randomWord,
  sequence,
  random,
  registration,
  login,
};
