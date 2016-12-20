var express = require('express');
var router = express.Router();
var fs = require('fs');

var cats;

fs.readFile('cats.json', 'utf8', (err, data) => {
  if (err) throw err;
  cats = JSON.parse(data);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('cats', {cats: cats['cats']} );
});

module.exports = router;
