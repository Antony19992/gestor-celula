const prisma = require('../lib/prisma');

async function getAll() {
  return prisma.meeting.findMany({ include: { study: true } });
}

async function getById(id) {
  return prisma.meeting.findUnique({ where: { id } });
}

async function getByIdWithDetails(id) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      study: true,
      participations: { include: { member: true } },
    },
  });
}

async function create(data) {
  return prisma.meeting.create({ data, include: { study: true } });
}

async function update(id, data) {
  return prisma.meeting.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.meeting.delete({ where: { id } });
}

module.exports = { getAll, getById, getByIdWithDetails, create, update, remove };
