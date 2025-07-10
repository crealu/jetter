const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

module.exports = {
  readScanned: async (response) => {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db('jetinfo');
      const co = db.collection('scanned');
      const docs = await co.find().toArray();
      response.send(docs);
    } finally {
      await client.close();
      return null;
    }
  }
}