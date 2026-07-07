const IDIOMAS = ['pt', 'en', 'es', 'fr'];

const MENSAGENS_SUCESSO = {
  cadastro: {
    pt: 'Cadastro realizado! Você receberá uma confirmação em instantes.',
    en: 'Registration complete! You will receive a confirmation shortly.',
    es: '¡Registro realizado! Recibirá una confirmación en instantes.',
    fr: 'Inscription réalisée ! Vous recevrez une confirmation sous peu.',
  },
  contato: {
    pt: 'Mensagem enviada! Retornaremos em breve.',
    en: 'Message sent! We will get back to you shortly.',
    es: '¡Mensaje enviado! Nos pondremos en contacto en breve.',
    fr: 'Message envoyé ! Nous vous répondrons sous peu.',
  },
};

let idiomaAtual = 'pt';

function setLanguage(lang) {
  if (!IDIOMAS.includes(lang)) return;
  idiomaAtual = lang;

  document.querySelectorAll('[data-lang]').forEach((el) => {
    el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
  });

  document.querySelectorAll('option[data-i18n]').forEach((opt) => {
    const traducoes = JSON.parse(opt.getAttribute('data-i18n'));
    if (traducoes[lang]) opt.textContent = traducoes[lang];
  });

  document.querySelectorAll('[data-lang-btn]').forEach((el) => {
    el.classList.toggle('ativo', el.getAttribute('data-lang-btn') === lang);
  });

  document.documentElement.lang = lang;
  localStorage.setItem('lp-lang', lang);
}

function entrarComoVisitante() {
  const painelCadastro = document.getElementById('painel-cadastro');
  const painelVisitante = document.getElementById('painel-visitante');
  if (painelCadastro && painelVisitante) {
    painelCadastro.style.display = 'none';
    painelVisitante.style.display = 'block';
  }
}

async function enviarFormulario(form, url, feedbackEl, mensagensSucesso) {
  const dados = Object.fromEntries(new FormData(form).entries());
  feedbackEl.textContent = '';
  feedbackEl.className = 'form-feedback';

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Não foi possível enviar. Tente novamente.');
    }

    feedbackEl.textContent = mensagensSucesso[idiomaAtual] || mensagensSucesso.pt;
    feedbackEl.classList.add('sucesso');
    form.reset();
  } catch (erro) {
    feedbackEl.textContent = erro.message;
    feedbackEl.classList.add('erro');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const idiomaSalvo = localStorage.getItem('lp-lang') || 'pt';
  setLanguage(idiomaSalvo);

  const params = new URLSearchParams(window.location.search);
  if (params.get('visitante') === '1') {
    entrarComoVisitante();
  }

  const formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormulario(
        formCadastro,
        '/api/cadastro',
        document.getElementById('cadastro-feedback'),
        MENSAGENS_SUCESSO.cadastro
      );
    });
  }

  const formContato = document.getElementById('form-contato');
  if (formContato) {
    formContato.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormulario(
        formContato,
        '/api/contato',
        document.getElementById('contato-feedback'),
        MENSAGENS_SUCESSO.contato
      );
    });
  }
});
