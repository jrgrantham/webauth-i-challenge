const db = require('../dbConfig')

module.exports = {
  find,
  findBy,
  findById,
  add
}

function find() {
  return db('users').select('username', 'password')
}

function findBy(filter) {
  return db('users').where(filter);
}

function add(user) {
  return db('users')
    .insert(user, 'id')
    .then(ids => {
      const [id] = ids;
      return findById(id);
    });
}

function findById(id) {
  return db('users')
    .where({ id })
    .first();
}
