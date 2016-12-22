var express = require('express');
var router = express.Router();
const mongodb = require('promised-mongo');

const url = 'mongodb://localhost:27017/webprogbase';
const db = mongodb(url);

/* GET home page. */
router.get('/', function(req, res, next) {
  db.cats.find()
  	.then(cats => res.render("cats", {cats:cats}))
    .catch(err => sendError(res, err));
});

module.exports = router;

function sendError(res, reason) {
  res.status(500).json({ error: String(reason) });
}

function sendResult(res, result) {
  res.json({ result });
}
