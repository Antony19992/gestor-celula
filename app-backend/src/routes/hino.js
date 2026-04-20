const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// Retorna hino do banco, ou 404 se ainda não foi visitado
router.get('/:numero', async (req, res, next) => {
  const numero = parseInt(req.params.numero, 10);
  if (isNaN(numero)) return res.status(400).json({ error: 'Número inválido.' });

  try {
    const hino = await prisma.hino.findUnique({ where: { numero } });
    if (!hino) return res.status(404).json({ error: 'Hino não encontrado.' });
    res.json(hino);
  } catch (err) {
    next(err);
  }
});

// Salva (ou atualiza) um hino capturado do site externo
router.post('/', async (req, res, next) => {
  const { numero, titulo, blocos } = req.body;
  if (!numero || !titulo || !blocos) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const hino = await prisma.hino.upsert({
      where: { numero },
      update: { titulo, blocos },
      create: { numero, titulo, blocos },
    });
    res.status(201).json(hino);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
