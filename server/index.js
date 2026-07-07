require('dotenv').config();
const path = require('path');
const express = require('express');
const db = require('./db');
const { enfileirarCadastro, enfileirarContato } = require('./queue');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function isEmailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/cadastro', async (req, res) => {
  const { nome, email, telefone, interesse, mensagem } = req.body || {};

  if (!nome || !isEmailValido(email)) {
    return res.status(400).json({ erro: 'Nome e e-mail válido são obrigatórios.' });
  }

  const cliente = await db.cliente.create({
    data: {
      nome,
      email,
      telefone: telefone || null,
      interesse: interesse || null,
      mensagem: mensagem || null,
    },
  });

  await enfileirarCadastro(cliente);

  res.status(201).json({ ok: true, id: cliente.id });
});

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
  console.log(`Lima & Perillo Consulting rodando em http://localhost:${PORT}`);
});
