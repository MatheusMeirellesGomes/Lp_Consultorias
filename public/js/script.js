const IDIOMAS = ['pt', 'en', 'es', 'fr'];

const MENSAGENS_SUCESSO = {
  login: {
    pt: 'Login realizado! Redirecionando...',
    en: 'Logged in! Redirecting...',
    es: '¡Sesión iniciada! Redirigiendo...',
    fr: 'Connexion réussie ! Redirection...',
  },
  registro: {
    pt: 'Conta criada! Redirecionando...',
    en: 'Account created! Redirecting...',
    es: '¡Cuenta creada! Redirigiendo...',
    fr: 'Compte créé ! Redirection...',
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

function mostrarAba(aba) {
  document.querySelectorAll('.auth-tab').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.tab === aba);
  });
  document.querySelectorAll('.aba-conteudo').forEach((form) => {
    form.style.display = form.dataset.aba === aba ? '' : 'none';
  });
}

function sair() {
  localStorage.removeItem('lp-token');
  localStorage.removeItem('lp-nome');
  window.location.href = 'index.html';
}

function atualizarContaNav() {
  const infoConta = document.getElementById('conta-info');
  if (!infoConta) return;

  const token = localStorage.getItem('lp-token');
  const nome = localStorage.getItem('lp-nome');
  const botoesConta = document.querySelectorAll('.area-cliente-btn');

  if (token && nome) {
    botoesConta.forEach((el) => { el.style.display = 'none'; });
    infoConta.style.display = '';
    infoConta.textContent = '';

    const saudacao = document.createElement('span');
    saudacao.textContent = `Olá, ${nome.split(' ')[0]}`;

    const botaoSair = document.createElement('button');
    botaoSair.type = 'button';
    botaoSair.className = 'link-sair';
    botaoSair.textContent = 'Sair';
    botaoSair.addEventListener('click', sair);

    infoConta.append(saudacao, document.createTextNode(' · '), botaoSair);
  } else {
    infoConta.style.display = 'none';
    setLanguage(idiomaAtual);
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

async function enviarFormularioAuth(form, url, feedbackEl, mensagensSucesso) {
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
      throw new Error(resultado.erro || 'Não foi possível concluir. Tente novamente.');
    }

    localStorage.setItem('lp-token', resultado.token);
    localStorage.setItem('lp-nome', resultado.nome);

    feedbackEl.textContent = mensagensSucesso[idiomaAtual] || mensagensSucesso.pt;
    feedbackEl.classList.add('sucesso');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  } catch (erro) {
    feedbackEl.textContent = erro.message;
    feedbackEl.classList.add('erro');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const idiomaSalvo = localStorage.getItem('lp-lang') || 'pt';
  setLanguage(idiomaSalvo);
  atualizarContaNav();

  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormularioAuth(formLogin, '/api/auth/login', document.getElementById('login-feedback'), MENSAGENS_SUCESSO.login);
    });
  }

  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', (evento) => {
      evento.preventDefault();
      enviarFormularioAuth(formRegistro, '/api/auth/registro', document.getElementById('registro-feedback'), MENSAGENS_SUCESSO.registro);
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

  const elementosRevelados = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && elementosRevelados.length) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visivel');
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elementosRevelados.forEach((el) => observador.observe(el));

    // Rede de segurança: se o observer não disparou nem uma vez (ex.: aba em
    // segundo plano), revela tudo para o conteúdo não ficar invisível para sempre.
    setTimeout(() => {
      const nenhumRevelado = document.querySelectorAll('.reveal.visivel').length === 0;
      if (nenhumRevelado) {
        elementosRevelados.forEach((el) => el.classList.add('visivel'));
        observador.disconnect();
      }
    }, 1500);
  } else {
    elementosRevelados.forEach((el) => el.classList.add('visivel'));
  }
});
