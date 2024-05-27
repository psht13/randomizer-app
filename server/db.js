const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb+srv://lapster20044:P%40ssw0rd@cluster0.kkmjyfj.mongodb.net/dataSite?retryWrites=true&w=majority&appName=Cluster0';

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