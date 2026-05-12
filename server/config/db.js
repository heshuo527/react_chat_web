import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://192.168.2.220:27017';
const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('chatapp');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = () => client.db('chatapp');
