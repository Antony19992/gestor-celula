const prisma = require('../lib/prisma');

async function getAll() {
  return prisma.study.findMany();
}

async function getById(id) {
  return prisma.study.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.study.create({ data });
}

async function update(id, data) {
  return prisma.study.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.study.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
