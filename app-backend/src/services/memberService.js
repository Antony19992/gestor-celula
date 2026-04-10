const repo = require('../repositories/memberRepository');

async function getAll() {
  return repo.getAll();
}

async function getById(id) {
  return repo.getById(id);
}

async function create(body) {
  return repo.create({ name: body.name });
}

async function update(id, body) {
  return repo.update(id, { name: body.name });
}

async function remove(id) {
  return repo.remove(id);
}

module.exports = { getAll, getById, create, update, remove };
