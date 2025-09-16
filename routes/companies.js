const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

module.exports = {
  getCompanies: async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
      await client.connect();
      const db = client.db('companies');
      const co = db.collection('companies');

      const docs = await co.find().toArray();
      response.send(docs);

    } finally {
      await client.close();
    }
  },

  addCompany: async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
      await client.connect();
      const db = client.db('companies');
      const co = db.collection('companies');

      const cb = (err, result) => { 
        if (err) {
          return console.log(err)
        }

        response.send({message: 'Submission successful'})
      }

      await co.insert(req.data, cb)
    } finally {
      await client.close();
    }
  },

  updateCompany: async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
      await client.connect();
      const db = client.db('companies');
      const co = db.collection('companies');

      // const cb = (err, result) => { 
      //   if (err) {
      //     return console.log(err)
      //   }

      //   response.send({message: 'Submission successful'})
      // }

      await co.findOneAndUpdate(
        { company: req.body.company },
        { $set: { website: req.body.website } },
        { sort: { _id: 1 }, upsert: true }
      )

    } finally {
      await client.close();
    }
  }
}