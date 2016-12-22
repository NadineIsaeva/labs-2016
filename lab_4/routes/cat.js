var express = require('express');
var router = express.Router();
const mongodb = require('promised-mongo');

const url = 'mongodb://localhost:27017/webprogbase';
const db = mongodb(url);

/* GET home page. */
router.get('/:id', function(req, res, next) {
  db.cats.find()
    .then(cats => res.render("cat", {
      name: cats[req.params.id]['name'],
      color: cats[req.params.id]['color'],
      age: cats[req.params.id]['age'],
      weight: cats[req.params.id]['weight'],
      img: cats[req.params.id]['img']
    }))
    .catch(err => sendError(res, err));
});

module.exports = router;

function sendError(res, reason) {
  res.status(500).json({ error: String(reason) });
}

function sendResult(res, result) {
  res.json({ result });
}
