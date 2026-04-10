const prisma = require('../lib/prisma');

async function getAll() {
  return prisma.member.findMany();
}

async function getById(id) {
  return prisma.member.findUnique({ where: { id } });
}

async function create(data) {
  return prisma.member.create({ data });
}

async function update(id, data) {
  return prisma.member.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.member.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
