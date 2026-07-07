function setLanguage(lang) {
  document.querySelectorAll('[data-lang]').forEach((el) => {
    el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
  });
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

async function enviarFormulario(form, url, feedbackEl, mensagemSucesso) {
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

    feedbackEl.textContent = mensagemSucesso;
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
        'Cadastro realizado! Você receberá um e-mail de confirmação em instantes.'
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
        'Mensagem enviada! Retornaremos em breve.'
      );
    });
  }
});
