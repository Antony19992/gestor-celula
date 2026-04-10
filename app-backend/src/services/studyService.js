const repo = require('../repositories/studyRepository');

function serialize(study) {
  return {
    ...study,
    questions: JSON.parse(study.questions),
    prayerTopics: JSON.parse(study.prayerTopics),
  };
}

function deserialize(body) {
  return {
    ...body,
    questions: JSON.stringify(body.questions ?? []),
    prayerTopics: JSON.stringify(body.prayerTopics ?? []),
  };
}

async function getAll() {
  return (await repo.getAll()).map(serialize);
}

async function getById(id) {
  const study = await repo.getById(id);
  return study ? serialize(study) : null;
}

async function create(body) {
  return serialize(await repo.create(deserialize(body)));
}

async function update(id, body) {
  return serialize(await repo.update(id, deserialize(body)));
}

async function remove(id) {
  return repo.remove(id);
}

module.exports = { getAll, getById, create, update, remove };
