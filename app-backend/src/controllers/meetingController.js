const service = require('../services/meetingService');
const drawService = require('../services/drawService');
const sse = require('../lib/sse');

async function getAll(req, res) {
  res.json(await service.getAll());
}

async function getById(req, res) {
  const meeting = await service.getById(Number(req.params.id));
  meeting ? res.json(meeting) : res.status(404).end();
}

async function create(req, res) {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await service.remove(Number(req.params.id));
    res.status(204).end();
  } catch {
    res.status(404).end();
  }
}

async function drawMember(req, res) {
  try {
    const meetingId = Number(req.params.id);
    const result = await drawService.drawMember(meetingId);
    sse.broadcast('draw', { ...result, meetingId });
    res.json(result);
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, remove, drawMember };
