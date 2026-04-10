const meetingRepo = require('../repositories/meetingRepository');
const studyRepo = require('../repositories/studyRepository');

function toResponse(m) {
  return {
    id: m.id,
    date: m.date,
    studyId: m.studyId,
    studyTitle: m.study?.title ?? '',
    lastDrawnMemberId: m.lastDrawnMemberId,
  };
}

async function getAll() {
  return (await meetingRepo.getAll()).map(toResponse);
}

async function getById(id) {
  const m = await meetingRepo.getByIdWithDetails(id);
  if (!m) return null;

  return {
    id: m.id,
    date: m.date,
    studyId: m.studyId,
    studyTitle: m.study?.title ?? '',
    lastDrawnMemberId: m.lastDrawnMemberId,
    participations: m.participations.map((p) => ({
      memberId: p.memberId,
      memberName: p.member.name,
      timesSelected: p.timesSelected,
      timesSpoken: p.timesSpoken,
    })),
  };
}

async function create(body) {
  const study = await studyRepo.getById(body.studyId);
  if (!study) throw Object.assign(new Error(`Estudo com id ${body.studyId} não encontrado.`), { status: 404 });

  const m = await meetingRepo.create({ date: new Date(body.date), studyId: body.studyId });
  return toResponse(m);
}

async function remove(id) {
  return meetingRepo.remove(id);
}

module.exports = { getAll, getById, create, remove };
