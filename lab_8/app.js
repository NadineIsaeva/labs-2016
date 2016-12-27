var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
const mongodb = require('promised-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const crypto = require('crypto');
const busboyBodyParser = require('busboy-body-parser');

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
app.use(busboyBodyParser({ limit: '5mb' }));
app.use(cookieParser());
app.use(session({
  secret: "ehgl904cy82348)(*&)(*^#)(&*QY#)(",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserializeUser id: " + id);
  db.users.findOne({ _id: mongodb.ObjectId(id) })
    .then(user => {
      if (user) {
        done(null, user);
      } else {
        done("No user", null);
      }
    })
    .catch(err => done(err, null));
});

passport.use(new LocalStrategy((username, password, done) => {
  console.log("Local: " + username + " : " + password);
  db.users.findOne({
    login: username,
    passwordHash: hash(password)
  })
    .then(user => {
      console.log(user);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch(err => {
      console.log(err);
      done(err, null);
    });
}));

function hash(pass) {
  return crypto.createHash('md5').update(pass).digest("hex");
}

app.get('/', (req, res) => res.render('index', { user: req.user }));

app.get('/login', (req, res) => {
  res.render("login", { user: req.user});
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => res.redirect('/'));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register', { user: req.user});
});

app.post('/register', (req, res) => {
  let login = req.body.login;
  let pass = req.body.pass;
  let pass2 = req.body.pass2;
  console.log(login, pass, pass2);
  if (!login || !pass || pass !== pass2) {
    sendError(res, "Invalid input!");
  }
  db.users.findOne({ login: login})
    .then(x => {
      if (x) {
        sendError(res, "User with that login exist!");
      } else {
        db.users.insert({
          login,
          passwordHash: hash(pass),
          role : "user"
        })
          .then(() => res.redirect('/'))
          .catch(err => sendError(err));
      }
    })
    .catch(err => sendError(err));
});

app.get('/profile', (req, res, next) => {
    if (req.user) next();
    else res.status(401).end('Not authorized');
  },
  (req, res) => res.render('user_index', { user: req.user})
);

app.get('/admin/some_pass', 
  (req, res) => {
    db.users.find()
      .then(users => sendResult(res, users))
      .catch(err => sendError(res, err));
  });

app.use('/', index);
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
    let avaFile = req.files.pic;    
    let img = avaFile.data.toString('base64');
    const cat = {
      id,
      name,
      color,
      age,
      weight,
      img
     };
     db.cats.insert(cat)
      .then(x => res.redirect('/cats'))
      .catch(err => sendError(res, err));
  })
  .catch(err => sendError(res, err));
});

app.get('/cats/:id', (req, res) => {
  db.cats.findOne({
    _id: mongodb.ObjectId(req.params.id)
  })
      .then(cat => {
        if (cat) {
          res.render("cat", cat);
        } else
          return Promise.reject(`Cat with id ${req.params.id} not found`);
      })
      .catch(err => sendError(res, err));
});

app.get('/del/:id', (req, res) => {
  db.cats.remove({
    _id: mongodb.ObjectId(req.params.id)
  }, true)
      .then(x => sendResult(res, x))
      .catch(err => sendError(res, err));
});

app.get('/catsJSON', (req, res) => {
  db.cats.find()
      .then(cats => sendResult(res, cats))
      .catch(err => sendError(res, err));
});



// =====API====
app.get('/api/cats', (req, res) => {
  db.cats.find()
      .then(cats => sendResult(res, cats))
      .catch(err => sendError(res, err));
})

app.post('/api/cats', function (req, res){
  db.cats.find({
  })
  .then(cats => {
    id = cats.length;
    const name = req.body.name;
    const color = req.body.color;
    const age = req.body.age;
    const weight = req.body.weight;
    const cat = {
      id,
      name,
      color,
      age,
      weight,
     };
     db.cats.insert(cat)
      .then(x => sendResult(res, x))
      .catch(err => sendError(res, err));
  })
})

app.get('/api/cats/:id', (req, res) => {
  db.cats.findOne({
    _id: mongodb.ObjectId(req.params.id)
  })
      .then(cat => {
        if (cat) {
          res.json(cat);
        } else
          return Promise.reject(`Cat with id ${req.params.id} not found`);
      })
      .catch(err => sendError(res, err));
});

app.put('/api/cats/:id', function (req, res){
  db.cats.findOne({
    _id: mongodb.ObjectId(req.params.id)
  })
  .then(cats => {
  	id = cats.length;
  	const name = req.body.name;
    const color = req.body.color;
    const age = req.body.age;
    const weight = req.body.weight;
    const cat = {
      id,
      name,
      color,
      age,
      weight,
     };
     db.cats.insert(cat)
      .then(x => sendResult(res, x))
      .catch(err => sendError(res, err));
  })
})

app.delete('/api/cats/:id', function (req, res){
  db.cats.remove({
    _id: mongodb.ObjectId(req.params.id)
  }, true)
      .then(x => sendResult(res, x))
      .catch(err => sendError(res, err));
})

app.get('/searching', function(req, res){
  if( req.query.search == ""){
    db.cats.find()
        .then(cats => res.send(JSON.stringify(cats)))
        .catch(err => sendError(res, err));
  }
  else {
    db.cats.find({name : req.query.search})
        .then(cats => res.send(JSON.stringify(cats)))
        .catch(err => sendError(res, err));
  }
});

module.exports = app;
