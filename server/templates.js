function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function cadastroConfirmacaoEmail(cliente) {
  const nome = escapeHtml(cliente.nome);
  return {
    assunto: 'Recebemos seu cadastro — Lima & Perillo Consulting',
    corpo: `<p>Olá, ${nome}!</p>
      <p>Recebemos seu cadastro na Lima & Perillo Consulting. Nossa equipe vai analisar suas informações e entrar em contato em breve.</p>
      <p>Obrigado pela confiança.</p>`,
  };
}

function cadastroNotificacaoAdminEmail(cliente) {
  const nome = escapeHtml(cliente.nome);
  return {
    assunto: `Novo cadastro: ${nome}`,
    corpo: `<p>Novo cliente cadastrado no site.</p>
      <ul>
        <li><b>Nome:</b> ${nome}</li>
        <li><b>E-mail:</b> ${escapeHtml(cliente.email)}</li>
        <li><b>Telefone:</b> ${escapeHtml(cliente.telefone) || '-'}</li>
        <li><b>Interesse:</b> ${escapeHtml(cliente.interesse) || '-'}</li>
        <li><b>Mensagem:</b> ${escapeHtml(cliente.mensagem) || '-'}</li>
      </ul>`,
  };
}

function contatoConfirmacaoEmail(contato) {
  const nome = escapeHtml(contato.nome);
  return {
    assunto: 'Recebemos sua mensagem — Lima & Perillo Consulting',
    corpo: `<p>Olá, ${nome}!</p>
      <p>Recebemos sua mensagem e retornaremos em breve.</p>`,
  };
}

function contatoNotificacaoAdminEmail(contato) {
  const nome = escapeHtml(contato.nome);
  return {
    assunto: `Nova mensagem de contato: ${nome}`,
    corpo: `<p>Nova mensagem recebida pelo formulário de contato.</p>
      <ul>
        <li><b>Nome:</b> ${nome}</li>
        <li><b>E-mail:</b> ${escapeHtml(contato.email)}</li>
        <li><b>Telefone:</b> ${escapeHtml(contato.telefone) || '-'}</li>
        <li><b>Mensagem:</b> ${escapeHtml(contato.mensagem)}</li>
      </ul>`,
  };
}

function cadastroConfirmacaoWhatsapp(cliente) {
  return `Olá, ${cliente.nome}! Recebemos seu cadastro na Lima & Perillo Consulting. Em breve nossa equipe entra em contato. Obrigado pela confiança.`;
}

function cadastroNotificacaoAdminWhatsapp(cliente) {
  return `Novo cadastro no site: ${cliente.nome} (${cliente.email}${cliente.telefone ? `, ${cliente.telefone}` : ''}). Interesse: ${cliente.interesse || '-'}.`;
}

function contatoConfirmacaoWhatsapp(contato) {
  return `Olá, ${contato.nome}! Recebemos sua mensagem na Lima & Perillo Consulting e retornaremos em breve.`;
}

function contatoNotificacaoAdminWhatsapp(contato) {
  return `Nova mensagem de contato no site: ${contato.nome} (${contato.email}${contato.telefone ? `, ${contato.telefone}` : ''}): "${contato.mensagem}"`;
}

module.exports = {
  cadastroConfirmacaoEmail,
  cadastroNotificacaoAdminEmail,
  contatoConfirmacaoEmail,
  contatoNotificacaoAdminEmail,
  cadastroConfirmacaoWhatsapp,
  cadastroNotificacaoAdminWhatsapp,
  contatoConfirmacaoWhatsapp,
  contatoNotificacaoAdminWhatsapp,
};
