require('dotenv').config();
const db = require('./db');
const { sendMail } = require('./mailer');
const { getWhatsAppClient } = require('./services/whatsapp');

const INTERVALO_MS = 5000;
const MAX_TENTATIVAS = 3;

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
  const pendentes = await db.notificacao.findMany({
    where: { status: 'pendente' },
    orderBy: { id: 'asc' },
    take: 5,
  });

  for (const item of pendentes) {
    await db.notificacao.update({ where: { id: item.id }, data: { status: 'processando' } });
    try {
      await enviar(item);
      await db.notificacao.update({
        where: { id: item.id },
        data: { status: 'enviado', enviadoEm: new Date() },
      });
      console.log(`[WORKER] ✅ ${item.canal} → ${item.destinatario} (${item.origem})`);
    } catch (erro) {
      const tentativas = item.tentativas + 1;
      const status = tentativas >= MAX_TENTATIVAS ? 'erro' : 'pendente';
      await db.notificacao.update({
        where: { id: item.id },
        data: { status, tentativas, erro: erro.message },
      });
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
