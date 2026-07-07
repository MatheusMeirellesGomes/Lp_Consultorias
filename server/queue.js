const db = require('./db');
const templates = require('./templates');

function enfileirar({ canal, destinatario, assunto, corpo, origem }) {
  if (!destinatario) return Promise.resolve();
  return db.notificacao.create({
    data: { canal, destinatario, assunto: assunto || null, corpo, origem },
  });
}

async function enfileirarCadastro(cliente) {
  const { ADMIN_EMAIL, ADMIN_WHATSAPP, SMTP_USER } = process.env;
  const adminEmail = ADMIN_EMAIL || SMTP_USER;

  const confirmacao = templates.cadastroConfirmacaoEmail(cliente);
  await enfileirar({ canal: 'email', destinatario: cliente.email, ...confirmacao, origem: 'cadastro' });

  if (adminEmail) {
    const notificacao = templates.cadastroNotificacaoAdminEmail(cliente);
    await enfileirar({ canal: 'email', destinatario: adminEmail, ...notificacao, origem: 'cadastro' });
  }

  if (cliente.telefone) {
    await enfileirar({
      canal: 'whatsapp',
      destinatario: cliente.telefone,
      corpo: templates.cadastroConfirmacaoWhatsapp(cliente),
      origem: 'cadastro',
    });
  }

  if (ADMIN_WHATSAPP) {
    await enfileirar({
      canal: 'whatsapp',
      destinatario: ADMIN_WHATSAPP,
      corpo: templates.cadastroNotificacaoAdminWhatsapp(cliente),
      origem: 'cadastro',
    });
  }
}

async function enfileirarContato(contato) {
  const { ADMIN_EMAIL, ADMIN_WHATSAPP, SMTP_USER } = process.env;
  const adminEmail = ADMIN_EMAIL || SMTP_USER;

  const confirmacao = templates.contatoConfirmacaoEmail(contato);
  await enfileirar({ canal: 'email', destinatario: contato.email, ...confirmacao, origem: 'contato' });

  if (adminEmail) {
    const notificacao = templates.contatoNotificacaoAdminEmail(contato);
    await enfileirar({ canal: 'email', destinatario: adminEmail, ...notificacao, origem: 'contato' });
  }

  if (contato.telefone) {
    await enfileirar({
      canal: 'whatsapp',
      destinatario: contato.telefone,
      corpo: templates.contatoConfirmacaoWhatsapp(contato),
      origem: 'contato',
    });
  }

  if (ADMIN_WHATSAPP) {
    await enfileirar({
      canal: 'whatsapp',
      destinatario: ADMIN_WHATSAPP,
      corpo: templates.contatoNotificacaoAdminWhatsapp(contato),
      origem: 'contato',
    });
  }
}

module.exports = { enfileirarCadastro, enfileirarContato };
