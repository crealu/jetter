const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

module.exports = {
	saveArticles: async (data, response) => {
	  const uri = process.env.MONGO_URI;
	  const client = new MongoClient(uri);

	  try {
	    await client.connect();
	    const db = client.db('jetinfo');
	    const co = db.collection('articles');

	    console.log(data);

	    const cb = (err, result) => { 
	      if (err) {
	        return console.log(err)
	      }
	      response.send({message: 'submitted'})
	    }

	    // await co.insertMany(data, cb)
	    // await co.insertOne(data, (err, result) => {
	    //   if (err) { 
	    //   	return console.log(err) 
	    //   }
	    //   // res.send('submitted');
	    //   // res.redirect('/create');
	    // })
	  } finally {
	    await client.close();
		}
	}
}