const service = require('../services/meetingService');
const drawService = require('../services/drawService');

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
    const result = await drawService.drawMember(Number(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, remove, drawMember };
