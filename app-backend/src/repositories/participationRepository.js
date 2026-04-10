const prisma = require('../lib/prisma');

async function getByMeetingId(meetingId) {
  return prisma.participation.findMany({ where: { meetingId } });
}

async function get(memberId, meetingId) {
  return prisma.participation.findUnique({
    where: { memberId_meetingId: { memberId, meetingId } },
  });
}

async function create(data) {
  return prisma.participation.create({ data });
}

async function update(memberId, meetingId, data) {
  return prisma.participation.update({
    where: { memberId_meetingId: { memberId, meetingId } },
    data,
  });
}

module.exports = { getByMeetingId, get, create, update };
