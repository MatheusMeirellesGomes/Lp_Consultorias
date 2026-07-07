require('dotenv').config();
const db = require('./db');
const { sendMail } = require('./mailer');
const { getWhatsAppClient } = require('./services/whatsapp');

const INTERVALO_MS = 5000;
const MAX_TENTATIVAS = 3;

const buscarPendentesStmt = db.prepare(`
  SELECT * FROM notificacoes WHERE status = 'pendente' ORDER BY id ASC LIMIT 5
`);
const marcarProcessandoStmt = db.prepare(`UPDATE notificacoes SET status = 'processando' WHERE id = ?`);
const marcarEnviadoStmt = db.prepare(`
  UPDATE notificacoes SET status = 'enviado', enviado_em = datetime('now') WHERE id = ?
`);
const marcarFalhaStmt = db.prepare(`
  UPDATE notificacoes SET status = ?, tentativas = ?, erro = ? WHERE id = ?
`);

async function enviar(item) {
  if (item.canal === 'email') {
    await sendMail({ to: item.destinatario, subject: item.assunto, html: item.corpo });
  } else if (item.canal === 'whatsapp') {
    const cliente = getWhatsAppClient();
    await cliente.sendMessage(item.destinatario, item.corpo);
  } else {
    throw new Error(`Canal desconhecido: ${item.canal}`);
  }
}

async function processarPendentes() {
  const pendentes = buscarPendentesStmt.all();

  for (const item of pendentes) {
    marcarProcessandoStmt.run(item.id);
    try {
      await enviar(item);
      marcarEnviadoStmt.run(item.id);
      console.log(`[WORKER] ✅ ${item.canal} → ${item.destinatario} (${item.origem})`);
    } catch (erro) {
      const tentativas = item.tentativas + 1;
      const status = tentativas >= MAX_TENTATIVAS ? 'erro' : 'pendente';
      marcarFalhaStmt.run(status, tentativas, erro.message, item.id);
      console.error(`[WORKER] ❌ ${item.canal} → ${item.destinatario} (tentativa ${tentativas}):`, erro.message);
    }
  }
}

async function tick() {
  try {
    await processarPendentes();
  } catch (erro) {
    console.error('[WORKER] erro geral:', erro);
  } finally {
    setTimeout(tick, INTERVALO_MS);
  }
}

console.log('[WORKER] iniciado — processando fila de notificações a cada 5s');
tick();
