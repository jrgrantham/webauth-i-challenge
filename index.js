const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bcrypt = require('bcryptjs')

const db = require('./source/dbConfig')
const Users = require('./source/users/users-model')

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.send('Server up and running')
})

server.post('/api/register', (req, res) => {
  const user = req.body
  const hash = bcrypt.hashSync(user.password)
  const newUser = {
    username: req.body.username,
    password: hash
  }
  Users.add(newUser)
    .then(saved => {
      res.status(200).json(saved)
    })
    .catch(error => {
      res.status(500).json(error)
    })
})

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));