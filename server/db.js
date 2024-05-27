require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoURI = process.env.DB_CONNECTION;

const client = new MongoClient(mongoURI);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('dataSite');
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = connectToDatabase;
