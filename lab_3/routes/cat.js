var express = require('express');
var router = express.Router();
var fs = require('fs');

var cats;

fs.readFile('cats.json', 'utf8', (err, data) => {
  if (err) throw err;
  cats = JSON.parse(data);
  console.log(cats);
});

/* GET home page. */
router.get('/:id', function(req, res, next) {

  res.render('cat', {
      name: cats['cats'][req.params.id]['name'],
      color: cats['cats'][req.params.id]['color'],
      age: cats['cats'][req.params.id]['age'],
      weight: cats['cats'][req.params.id]['weight'],
      img: cats['cats'][req.params.id]['img']
  });
});

module.exports = router;
