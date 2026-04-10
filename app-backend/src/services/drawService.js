const meetingRepo = require('../repositories/meetingRepository');
const memberRepo = require('../repositories/memberRepository');
const participationRepo = require('../repositories/participationRepository');

async function drawMember(meetingId) {
  const meeting = await meetingRepo.getById(meetingId);
  if (!meeting) throw Object.assign(new Error(`Encontro ${meetingId} não encontrado.`), { status: 404 });

  const allMembers = await memberRepo.getAll();
  if (allMembers.length === 0)
    throw Object.assign(new Error('Nenhum membro cadastrado.'), { status: 400 });

  const participations = await participationRepo.getByMeetingId(meetingId);

  // Contagem de vezes sorteado por membro neste encontro
  const selectionCount = Object.fromEntries(
    allMembers.map((m) => [m.id, participations.find((p) => p.memberId === m.id)?.timesSelected ?? 0])
  );

  // Exclui o último sorteado para evitar repetição consecutiva
  let candidates = [...allMembers];
  if (meeting.lastDrawnMemberId && candidates.length > 1)
    candidates = candidates.filter((m) => m.id !== meeting.lastDrawnMemberId);

  // Prioriza quem foi menos selecionado
  const minSelections = Math.min(...candidates.map((m) => selectionCount[m.id]));
  const leastSelected = candidates.filter((m) => selectionCount[m.id] === minSelections);

  // Sorteio aleatório entre os menos selecionados
  const selected = leastSelected[Math.floor(Math.random() * leastSelected.length)];

  // Atualiza ou cria participação
  const existing = participations.find((p) => p.memberId === selected.id);
  let timesSelected;
  if (!existing) {
    const created = await participationRepo.create({
      memberId: selected.id,
      meetingId,
      timesSelected: 1,
      timesSpoken: 0,
    });
    timesSelected = created.timesSelected;
  } else {
    timesSelected = existing.timesSelected + 1;
    await participationRepo.update(selected.id, meetingId, { timesSelected });
  }

  // Registra último sorteado
  await meetingRepo.update(meetingId, { lastDrawnMemberId: selected.id });

  return { memberId: selected.id, memberName: selected.name, timesSelectedInThisMeeting: timesSelected };
}

module.exports = { drawMember };
