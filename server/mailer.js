const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
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
    from: `"LP Consultorias" <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
