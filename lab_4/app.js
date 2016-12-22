var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
const mongodb = require('promised-mongo');

var index = require('./routes/index');
var cats = require('./routes/cats');
var cat = require('./routes/cat');
const create = require('./routes/create');

var app = express();

const url = 'mongodb://localhost:27017/webprogbase';
const db = mongodb(url);

function sendError(res, reason) {
  res.status(500).json({ error: String(reason) });
}

function sendResult(res, result) {
  res.json({ result });
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index); //пути
app.use('/cats', cats);
app.use('/cat', cat);
app.use('/create', create);

app.post('/cats', (req, res) => {
	let id = 99;
	db.cats.find()
  .then(cats => {
  	id = cats.length;
  	const name = req.body.name;
    const color = req.body.color;
    const age = req.body.age;
    const weight = req.body.weight;
    const img = req.body.img;
    const cat = {
      id,
      name,
      color,
      age,
      weight,
      img
     };
     db.cats.insert(cat)
      .then(x => sendResult(res, x))
      .catch(err => sendError(res, err));
  })
  .catch(err => sendError(res, err));
});

app.get('/catsJSON', (req, res) => {
  db.cats.find()
      .then(books => sendResult(res, books))
      .catch(err => sendError(res, err));
});

module.exports = app;
