var express = require('express');
var router = express.Router();
const mongodb = require('promised-mongo');

const url = 'mongodb://localhost:27017/webprogbase';
const db = mongodb(url);

/* GET home page. */
router.get('/', function(req, res){
	db.cats.find()
		.then(cats => {
			res.render('cats', {
         cats: cats,
				 user: req.user,
				 search: "nothing",
				 lol: "posts"
			});
		})
    .catch(err => sendError(res, err));
});

router.get('/deletecat/:id', function (req, res){
	db.cats.remove({
					id: req.params.id
			}, true)
      .then(x => res.redirect('/cats'))
      .catch(err => sendError(res, err));
});

router.get('/search', function(req, res) {
	var lol = "posts";
	if (req.query.name == '')
		res.redirect('/cats');
	else {
		db.cats.find ({name: req.query.name})
			.then(cats => { 
				db.cats.findOne( {name: req.query.name})
					.then(cat => {
						if (cat == null){
							res.render('cats', {
						  	cats: cats,
								user: req.user,
								search: req.query.name,
								lol : "noposts",
							});
						} else {
							res.render('cats', {
						    cats: cats,
								user: req.user,
								search: req.query.name,
								lol : lol,
							});
						}
					})
					.catch(err => sendError(res, err));
			})
			.catch(err => sendError(res, err));
	}
});

router.post('/deletecat', function (req, res){
  db.cats.remove({
          _id: mongodb.ObjectId(req.body.todelete)
      }, true)
      .then(x => res.redirect('/cats'))
      .catch(err => sendError(res, err));
});

module.exports = router;

function sendError(res, reason) {
  res.status(500).json({ error: String(reason) });
}

function sendResult(res, result) {
  res.json({ result });
}
