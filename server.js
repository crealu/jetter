const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { saveArticles } = require('./routes/publish');
const { readScanned } = require('./routes/scan');
const { viewArticles } = require('./routes/view');

const app = express();
const port = process.env.PORT || 7700;
dotenv.config({ path: '.env' });

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: './public'});
});

app.get('/admin', (req, res) => {
  res.sendFile('admin.html', {root: './public'});
});

app.get('/news', (req, res) => {
  res.sendFile('news.html', {root: './public'});
});

app.get('/scan', (req, res) => {
  res.sendFile('scan.html', {root: './public'});
});

app.get('/companies', (req, res) => {
  res.sendFile('companies.json', {root: './public/data'});
})

app.get('/scanner', (req, res) => {
  res.send('scan');
});

app.get('/publisher', (req, res) => {
  readScanned(res);
});

app.get('/viewer', (req, res) => {
  viewArticles(res);
});

app.post('/save-articles', (req, res) => {
	saveArticles(req.body, res);
});

app.listen(port, () => { 
	console.log('Listening on port ' + port)
});
