const service = require('../services/studyService');

async function getAll(req, res) {
  res.json(await service.getAll());
}

async function getById(req, res) {
  const study = await service.getById(Number(req.params.id));
  study ? res.json(study) : res.status(404).end();
}

async function create(req, res) {
  const created = await service.create(req.body);
  res.status(201).json(created);
}

async function update(req, res) {
  try {
    res.json(await service.update(Number(req.params.id), req.body));
  } catch {
    res.status(404).end();
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

module.exports = { getAll, getById, create, update, remove };
