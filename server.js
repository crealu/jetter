const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 7700;
dotenv.config({ path: '.env' });

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function saveArticles(data, response) {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('jetinfo');
    const co = db.collection('articles');

    const cb = (err, result) => { 
      if (err) {
        return console.log(err)
      }
      response.send({message: 'submitted'})
    }

    await co.insertMany(data, cb)
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

async function sendScanned(response) {
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

async function sendArticles(response) {  
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('jetinfo');
    const co = db.collection('articles');
    const docs = await co.find().toArray();
    response.send(docs);
  } finally {
    await client.close();
    return null;
	}
}

app.get('/', (req, res) => {
	res.send('working');
});

app.get('/admin', (req, res) => {
  res.sendFile('publisher.html', {root: './public'});
});

app.get('/news', (req, res) => {
  res.sendFile('news.html', {root: './public'});
});

app.get('/scan', (req, res) => {
  res.sendFile('scan.html', {root: './public'});
});

app.get('/scanner', (req, res) => {
  res.send('scan');
});

app.get('/publisher', (req, res) => {
  sendScanned(res);
});

app.get('/viewer', (req, res) => {
  sendArticles(res);
});

app.post('/save-articles', (req, res) => {
	saveArticles(req.body, res);
});

app.listen(port, () => { 
	console.log('Listening on port ' + port)
});
