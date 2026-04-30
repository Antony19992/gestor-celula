const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/study', require('./routes/study'));
app.use('/api/member', require('./routes/member'));
app.use('/api/meeting', require('./routes/meeting'));
app.use('/api/hino', require('./routes/hino'));

app.get('/api/events', require('./controllers/eventsController').subscribe);
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Tratamento de erros global
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
