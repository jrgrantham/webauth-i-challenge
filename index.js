require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const Users = require('./source/users/users-model');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(
  session({
    name: 'myfirstcookie',
    secret: process.env.SECRET || 'secret',
    cookie: {
      maxAge: 1000 * 20,
      secure: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false
  })
);

server.get('/', (req, res) => {
  res.send('Server up and running');
});

server.post('/api/register', (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password);
  const newUser = {
    username: req.body.username,
    password: hash
  };
  Users.add(newUser)
    .then(saved => {
      res.status(200).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// function restricted(req, res, next) {
//   const { username, password } = req.headers;
//   Users.findBy({ username })
//     .first()
//     .then(user => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         next();
//       } else {
//         res.status(401).json({ message: 'Invalid Credentials' });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// }

function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'you shall not pass' });
  }
}

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send('error logging out');
      } else {
        res.send('good bye');
      }
    });
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
