const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;
const configured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = configured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[mailer] SMTP não configurado (.env). E-mail não enviado.\nPara: ${to}\nAssunto: ${subject}\n${html}\n`);
    return { simulated: true };
  }
  return transporter.sendMail({
    from: `"Lima & Perillo Consulting" <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

async function notificarNovoCadastro(cliente) {
  const adminTo = ADMIN_EMAIL || SMTP_USER;
  const nome = escapeHtml(cliente.nome);

  await sendMail({
    to: cliente.email,
    subject: 'Recebemos seu cadastro — Lima & Perillo Consulting',
    html: `<p>Olá, ${nome}!</p>
      <p>Recebemos seu cadastro na Lima & Perillo Consulting. Nossa equipe vai analisar suas informações e entrar em contato em breve.</p>
      <p>Obrigado pela confiança.</p>`,
  });

  if (adminTo) {
    await sendMail({
      to: adminTo,
      subject: `Novo cadastro: ${nome}`,
      html: `<p>Novo cliente cadastrado no site.</p>
        <ul>
          <li><b>Nome:</b> ${nome}</li>
          <li><b>E-mail:</b> ${escapeHtml(cliente.email)}</li>
          <li><b>Telefone:</b> ${escapeHtml(cliente.telefone) || '-'}</li>
          <li><b>Interesse:</b> ${escapeHtml(cliente.interesse) || '-'}</li>
          <li><b>Mensagem:</b> ${escapeHtml(cliente.mensagem) || '-'}</li>
        </ul>`,
    });
  }
}

async function notificarNovoContato(contato) {
  const adminTo = ADMIN_EMAIL || SMTP_USER;
  const nome = escapeHtml(contato.nome);

  await sendMail({
    to: contato.email,
    subject: 'Recebemos sua mensagem — Lima & Perillo Consulting',
    html: `<p>Olá, ${nome}!</p>
      <p>Recebemos sua mensagem e retornaremos em breve.</p>`,
  });

  if (adminTo) {
    await sendMail({
      to: adminTo,
      subject: `Nova mensagem de contato: ${nome}`,
      html: `<p>Nova mensagem recebida pelo formulário de contato.</p>
        <ul>
          <li><b>Nome:</b> ${nome}</li>
          <li><b>E-mail:</b> ${escapeHtml(contato.email)}</li>
          <li><b>Telefone:</b> ${escapeHtml(contato.telefone) || '-'}</li>
          <li><b>Mensagem:</b> ${escapeHtml(contato.mensagem)}</li>
        </ul>`,
    });
  }
}

module.exports = { notificarNovoCadastro, notificarNovoContato };
