const bcrypt = require('bcryptjs');
const connectToDatabase = require('./db');
const jwt = require('jsonwebtoken');
const { secret } = require('./models/ConfigKey');
require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

function getCryptoRandom() {
  const buffer = new Uint32Array(1);
  crypto.randomFillSync(buffer);
  return buffer[0] / (0xffffffff + 1);
}

const getQueryHistory = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const history = await db
      .collection('Queries')
      .find({ user_id: new ObjectId(user_id) })
      .toArray();
    res.json(history);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const requests = await db.collection('Queries').find().toArray();
    res.json(requests);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStatistics = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const userId = req.query.user_id; // Retrieve user_id from query parameters

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const requestTypes = await db
      .collection('Queries')
      .aggregate([
        { $unwind: '$requests' },
        { $group: { _id: '$requests.queryType', count: { $sum: 1 } } },
      ])
      .toArray();

    const userRequests = await db
      .collection('Queries')
      .aggregate([
        { $match: { user_id: new ObjectId(userId) } },
        { $unwind: '$requests' },
        { $group: { _id: '$requests.queryType', count: { $sum: 1 } } },
      ])
      .toArray();

    const userRequestsCount = userRequests.reduce(
      (acc, item) => acc + item.count,
      0
    );

    res.json({
      requestTypes,
      userRequests: {
        _id: userId,
        requestTypes: userRequests,
        count: userRequestsCount,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRandomQueryFromHistory = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const userQueries = await db
      .collection('Queries')
      .find({ user_id: new ObjectId(user_id) })
      .toArray();

    if (userQueries.length === 0) {
      return res.status(404).json({ error: 'No queries found for this user' });
    }

    const randomIndex = Math.floor(getCryptoRandom() * userQueries.length);
    const randomQuery = userQueries[randomIndex];

    res.json(randomQuery);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateAuthToken = (id, username) => {
  const payload = {
    id,
    username,
  };
  return jwt.sign(payload, secret, { expiresIn: '24H' });
};

const generatePasswords = async (req, res) => {
  const { quantity, length } = req.body;
  const userId = req.query.user_id;
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
        let randomIndex = Math.floor(getCryptoRandom() * charset.length);
        password += charset[randomIndex];
      }
      passwordSet.push(password);
    }
    if (userId) {
      try {
        if (!ObjectId.isValid(userId)) {
          res.send(result);
          return;
        }
        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        await db.collection('Queries').updateOne(
          { user_id: userObjectId },
          {
            $push: {
              requests: {
                queryType: 'generatePasswords',
                request_time: new Date(),
                input: { quantity, length },
                output: passwordSet,
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Помилка при збереженні даних до бази.');
        return;
      }
    }
    res.json({ passwordSet: passwordSet });
  }
};

const generatePassword = async (req, res) => {
  const { length } = req.body;
  const userId = req.query.user_id;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-+=';

  if (isNaN(length) || length <= 0) {
    res
      .status(400)
      .json({ error: 'Будь ласка, введіть коректну довжину пароля.' });
  } else {
    let password = '';
    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(getCryptoRandom() * charset.length);
      password += charset[randomIndex];
    }

    if (userId) {
      try {
        if (!ObjectId.isValid(userId)) {
          res.send(result);
          return;
        }

        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        await db.collection('Queries').updateOne(
          { user_id: userObjectId },
          {
            $push: {
              requests: {
                queryType: 'generatePassword',
                request_time: new Date(),
                input: { length },
                output: password,
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Помилка при збереженні даних до бази.');
        return;
      }
    }
    res.json({ password: password });
  }
};

const randomWord = async (req, res) => {
  const { text } = req.body;
  const userId = req.query.user_id;
  const words = text.split(/\s+/).filter(word => word.trim() !== '');

  if (words.length === 0) {
    res.status(400).json({ error: 'Будь ласка, введіть текст.' });
  } else {
    const randomIndex = Math.floor(getCryptoRandom() * words.length);
    const randomWord = words[randomIndex];

    if (userId) {
      try {
        if (!ObjectId.isValid(userId)) {
          res.json({ randomWord: randomWord });
          return;
        }

        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        await db.collection('Queries').updateOne(
          { user_id: userObjectId },
          {
            $push: {
              requests: {
                queryType: 'randomWord',
                request_time: new Date(),
                input: { text },
                output: randomWord,
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Помилка при збереженні даних до бази.');
        return;
      }
    }
    res.json({ randomWord: randomWord });
  }
};

const sequence = async (req, res) => {
  const quantity = parseInt(req.query.quantity);
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);
  const userId = req.query.user_id; // Retrieve user_id from query parameters

  if (isNaN(min) || isNaN(max) || isNaN(quantity)) {
    res.status(400).send('Будь ласка, введіть коректні значення.');
  } else if (min >= max) {
    res.status(400).send('Значення max повинно бути більшим за значення min.');
  } else {
    let result = '';
    for (let i = 0; i < quantity; i++) {
      result += Math.floor(getCryptoRandom() * (max - min + 1)) + min + ', ';
    }

    if (userId) {
      try {
        if (!ObjectId.isValid(userId)) {
          res.send(result);
          return;
        }

        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        await db.collection('Queries').updateOne(
          { user_id: userObjectId },
          {
            $push: {
              requests: {
                queryType: 'sequence',
                request_time: new Date(),
                input: { quantity, min, max },
                output: result,
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Помилка при збереженні даних до бази.');
        return;
      }
    }

    res.send(result);
  }
};

const random = async (req, res) => {
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);
  const userId = req.query.user_id;

  if (isNaN(min) || isNaN(max)) {
    res.status(400).send('Будь ласка, введіть числа.');
  } else if (min >= max) {
    res
      .status(400)
      .send('Мінімальне значення повинно бути менше за максимальне.');
  } else {
    const randomNumber = Math.floor(getCryptoRandom() * (max - min + 1)) + min;
    if (userId) {
      try {
        if (!ObjectId.isValid(userId)) {
          res.send(result);
          return;
        }
        const db = await connectToDatabase();
        const userObjectId = new ObjectId(userId);
        await db.collection('Queries').updateOne(
          { user_id: userObjectId },
          {
            $push: {
              requests: {
                queryType: 'random',
                request_time: new Date(),
                input: { min, max },
                output: randomNumber,
              },
            },
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).send('Помилка при збереженні даних до бази.');
        return;
      }
    }
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
    return res.json({ token: token, user_id: candidateU._id });
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
  getQueryHistory,
  getAllRequests,
  getStatistics,
  getRandomQueryFromHistory,
};
