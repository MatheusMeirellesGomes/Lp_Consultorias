const db = require('./db');
const templates = require('./templates');

const insertStmt = db.prepare(`
  INSERT INTO notificacoes (canal, destinatario, assunto, corpo, origem)
  VALUES (@canal, @destinatario, @assunto, @corpo, @origem)
`);

function enfileirar({ canal, destinatario, assunto, corpo, origem }) {
  if (!destinatario) return;
  insertStmt.run({ canal, destinatario, assunto: assunto || null, corpo, origem });
}

function enfileirarCadastro(cliente) {
  const { ADMIN_EMAIL, ADMIN_WHATSAPP, SMTP_USER } = process.env;
  const adminEmail = ADMIN_EMAIL || SMTP_USER;

  const confirmacao = templates.cadastroConfirmacaoEmail(cliente);
  enfileirar({ canal: 'email', destinatario: cliente.email, ...confirmacao, origem: 'cadastro' });

  if (adminEmail) {
    const notificacao = templates.cadastroNotificacaoAdminEmail(cliente);
    enfileirar({ canal: 'email', destinatario: adminEmail, ...notificacao, origem: 'cadastro' });
  }

  if (cliente.telefone) {
    enfileirar({
      canal: 'whatsapp',
      destinatario: cliente.telefone,
      corpo: templates.cadastroConfirmacaoWhatsapp(cliente),
      origem: 'cadastro',
    });
  }

  if (ADMIN_WHATSAPP) {
    enfileirar({
      canal: 'whatsapp',
      destinatario: ADMIN_WHATSAPP,
      corpo: templates.cadastroNotificacaoAdminWhatsapp(cliente),
      origem: 'cadastro',
    });
  }
}

function enfileirarContato(contato) {
  const { ADMIN_EMAIL, ADMIN_WHATSAPP, SMTP_USER } = process.env;
  const adminEmail = ADMIN_EMAIL || SMTP_USER;

  const confirmacao = templates.contatoConfirmacaoEmail(contato);
  enfileirar({ canal: 'email', destinatario: contato.email, ...confirmacao, origem: 'contato' });

  if (adminEmail) {
    const notificacao = templates.contatoNotificacaoAdminEmail(contato);
    enfileirar({ canal: 'email', destinatario: adminEmail, ...notificacao, origem: 'contato' });
  }

  if (contato.telefone) {
    enfileirar({
      canal: 'whatsapp',
      destinatario: contato.telefone,
      corpo: templates.contatoConfirmacaoWhatsapp(contato),
      origem: 'contato',
    });
  }

  if (ADMIN_WHATSAPP) {
    enfileirar({
      canal: 'whatsapp',
      destinatario: ADMIN_WHATSAPP,
      corpo: templates.contatoNotificacaoAdminWhatsapp(contato),
      origem: 'contato',
    });
  }
}

module.exports = { enfileirarCadastro, enfileirarContato };
