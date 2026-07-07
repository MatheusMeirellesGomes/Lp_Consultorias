require('dotenv').config();
const path = require('path');
const express = require('express');
const db = require('./db');
const { enfileirarContato } = require('./queue');
const authRouter = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/auth', authRouter);

function isEmailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/contato', async (req, res) => {
  const { nome, email, telefone, mensagem } = req.body || {};

  if (!nome || !isEmailValido(email) || !mensagem) {
    return res.status(400).json({ erro: 'Nome, e-mail válido e mensagem são obrigatórios.' });
  }

  const contato = await db.contato.create({
    data: { nome, email, telefone: telefone || null, mensagem },
  });

  await enfileirarContato(contato);

  res.status(201).json({ ok: true, id: contato.id });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`LP Consultorias rodando em http://localhost:${PORT}`);
});
