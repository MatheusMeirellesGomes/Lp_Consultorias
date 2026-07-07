const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { enfileirarCadastro } = require('./queue');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-troque-isso-no-env';
const JWT_EXPIRES_IN = '7d';

function isEmailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nome: usuario.nome, email: usuario.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

router.post('/registro', async (req, res) => {
  const { nome, email, senha, telefone, interesse, mensagem } = req.body || {};

  if (!nome || !isEmailValido(email) || !senha || senha.length < 6) {
    return res.status(400).json({
      erro: 'Nome, e-mail válido e senha (mínimo 6 caracteres) são obrigatórios.',
    });
  }

  const existente = await db.usuario.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await db.usuario.create({
    data: { nome, email, senha: senhaHash, telefone: telefone || null },
  });

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

  res.status(201).json({ token: gerarToken(usuario), nome: usuario.nome, email: usuario.email });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {};

  if (!isEmailValido(email) || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  const usuario = await db.usuario.findUnique({ where: { email } });
  const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senha));

  if (!senhaOk) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  res.json({ token: gerarToken(usuario), nome: usuario.nome, email: usuario.email });
});

module.exports = router;
