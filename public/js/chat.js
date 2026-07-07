const CHAT_WHATSAPP_URL = 'https://wa.me/5561995299277?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consultoria%20com%20a%20LP%20Consultorias.';

const CHAT_TEXTOS = {
  titulo: { pt: 'Assistente LP', en: 'LP Assistant', es: 'Asistente LP', fr: 'Assistant LP' },
  abrirWhatsapp: { pt: 'Abrir WhatsApp', en: 'Open WhatsApp', es: 'Abrir WhatsApp', fr: 'Ouvrir WhatsApp' },
  irParaCadastro: { pt: 'Criar minha conta', en: 'Create my account', es: 'Crear mi cuenta', fr: 'Créer mon compte' },
  verServicos: { pt: 'Ver serviços na página', en: 'See services on the page', es: 'Ver servicios en la página', fr: 'Voir les services sur la page' },
  voltar: { pt: '← Voltar ao menu', en: '← Back to menu', es: '← Volver al menú', fr: '← Retour au menu' },
};

const CHAT_FLUXO = {
  inicio: {
    mensagem: {
      pt: 'Olá! Sou o assistente virtual da LP Consultorias. Como posso ajudar?',
      en: 'Hello! I am LP Consultorias\' virtual assistant. How can I help?',
      es: '¡Hola! Soy el asistente virtual de LP Consultorias. ¿Cómo puedo ayudar?',
      fr: 'Bonjour ! Je suis l\'assistant virtuel de LP Consultorias. Comment puis-je vous aider ?',
    },
    opcoes: [
      { label: { pt: 'Quais serviços vocês oferecem?', en: 'What services do you offer?', es: '¿Qué servicios ofrecen?', fr: 'Quels services proposez-vous ?' }, next: 'servicos' },
      { label: { pt: 'Como funciona a metodologia?', en: 'How does the methodology work?', es: '¿Cómo funciona la metodología?', fr: 'Comment fonctionne la méthodologie ?' }, next: 'metodologia' },
      { label: { pt: 'Como faço para me cadastrar?', en: 'How do I register?', es: '¿Cómo me registro?', fr: 'Comment puis-je m\'inscrire ?' }, next: 'cadastro' },
      { label: { pt: 'Quero falar com um consultor', en: 'I want to talk to a consultant', es: 'Quiero hablar con un asesor', fr: 'Je veux parler à un consultant' }, next: 'whatsapp' },
    ],
  },
  servicos: {
    mensagem: {
      pt: 'Trabalhamos com 4 frentes: Assessoria de Imprensa Internacional, Artigos de Autoria, Cartas Estratégicas e Documentação Profissional.',
      en: 'We work across 4 areas: International Press Advisory, Authored Articles, Strategic Letters, and Professional Documentation.',
      es: 'Trabajamos en 4 áreas: Asesoría de Prensa Internacional, Artículos de Autoría, Cartas Estratégicas y Documentación Profesional.',
      fr: 'Nous intervenons sur 4 axes : Conseil en Relations Presse Internationales, Articles Signés, Lettres Stratégiques et Documentation Professionnelle.',
    },
    opcoes: [
      { label: CHAT_TEXTOS.verServicos, action: 'servicos' },
      { label: CHAT_TEXTOS.voltar, next: 'inicio' },
    ],
  },
  metodologia: {
    mensagem: {
      pt: 'Nossa metodologia tem 4 etapas: Análise, Estratégia, Desenvolvimento e Entrega — cada uma pensada para a sua trajetória específica.',
      en: 'Our methodology has 4 steps: Analysis, Strategy, Development, and Delivery — each tailored to your specific path.',
      es: 'Nuestra metodología tiene 4 etapas: Análisis, Estrategia, Desarrollo y Entrega, cada una adaptada a su trayectoria.',
      fr: 'Notre méthodologie comporte 4 étapes : Analyse, Stratégie, Développement et Livraison, chacune adaptée à votre parcours.',
    },
    opcoes: [
      { label: CHAT_TEXTOS.voltar, next: 'inicio' },
    ],
  },
  cadastro: {
    mensagem: {
      pt: 'Você pode criar sua conta gratuitamente na nossa página de cadastro, ou navegar sem conta se preferir.',
      en: 'You can create a free account on our registration page, or browse without one if you prefer.',
      es: 'Puede crear su cuenta gratis en nuestra página de registro, o navegar sin cuenta si lo prefiere.',
      fr: 'Vous pouvez créer un compte gratuitement sur notre page d\'inscription, ou naviguer sans compte si vous préférez.',
    },
    opcoes: [
      { label: CHAT_TEXTOS.irParaCadastro, action: 'cadastro' },
      { label: CHAT_TEXTOS.voltar, next: 'inicio' },
    ],
  },
  whatsapp: {
    mensagem: {
      pt: 'Claro! Você pode falar direto com nossa equipe pelo WhatsApp, com uma mensagem já pronta.',
      en: 'Sure! You can talk directly with our team on WhatsApp, with a message already filled in.',
      es: '¡Claro! Puede hablar directamente con nuestro equipo por WhatsApp, con un mensaje ya redactado.',
      fr: 'Bien sûr ! Vous pouvez discuter directement avec notre équipe sur WhatsApp, avec un message déjà rédigé.',
    },
    opcoes: [
      { label: CHAT_TEXTOS.abrirWhatsapp, action: 'whatsapp' },
      { label: CHAT_TEXTOS.voltar, next: 'inicio' },
    ],
  },
};

function chatTexto(campo) {
  return campo[typeof idiomaAtual !== 'undefined' ? idiomaAtual : 'pt'] || campo.pt;
}

function chatExecutarAcao(acao) {
  if (acao === 'whatsapp') {
    window.open(CHAT_WHATSAPP_URL, '_blank', 'noopener');
  } else if (acao === 'cadastro') {
    window.location.href = 'cadastro.html';
  } else if (acao === 'servicos') {
    window.location.href = 'index.html#servicos';
  }
}

function chatRenderizarNo(idNo) {
  const no = CHAT_FLUXO[idNo];
  const mensagens = document.getElementById('chat-mensagens');
  const opcoesEl = document.getElementById('chat-opcoes');
  if (!no || !mensagens || !opcoesEl) return;

  const bolha = document.createElement('div');
  bolha.className = 'chat-msg bot';
  bolha.textContent = chatTexto(no.mensagem);
  mensagens.appendChild(bolha);
  mensagens.scrollTop = mensagens.scrollHeight;

  opcoesEl.innerHTML = '';
  no.opcoes.forEach((opcao) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'chat-opcao';
    botao.textContent = chatTexto(opcao.label);
    botao.addEventListener('click', () => {
      const bolhaUsuario = document.createElement('div');
      bolhaUsuario.className = 'chat-msg usuario';
      bolhaUsuario.textContent = chatTexto(opcao.label);
      mensagens.appendChild(bolhaUsuario);
      mensagens.scrollTop = mensagens.scrollHeight;

      if (opcao.action) chatExecutarAcao(opcao.action);
      if (opcao.next) chatRenderizarNo(opcao.next);
    });
    opcoesEl.appendChild(botao);
  });
}

function chatAlternarPainel() {
  const painel = document.getElementById('chat-painel');
  if (!painel) return;
  const abrindo = !painel.classList.contains('aberto');
  painel.classList.toggle('aberto');

  const tituloEl = document.getElementById('chat-titulo');
  if (tituloEl) tituloEl.textContent = chatTexto(CHAT_TEXTOS.titulo);

  if (abrindo && !painel.dataset.iniciado) {
    painel.dataset.iniciado = '1';
    chatRenderizarNo('inicio');
  }
}

function chatMontarWidget() {
  const raiz = document.getElementById('chat-widget');
  if (!raiz) return;

  raiz.innerHTML = `
    <button class="chat-bubble" type="button" aria-label="Assistente virtual" onclick="chatAlternarPainel()">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="chat-painel" id="chat-painel">
      <div class="chat-cabecalho">
        <strong id="chat-titulo"></strong>
        <button type="button" onclick="chatAlternarPainel()" aria-label="Fechar">✕</button>
      </div>
      <div class="chat-mensagens" id="chat-mensagens"></div>
      <div class="chat-opcoes" id="chat-opcoes"></div>
    </div>
  `;

  document.getElementById('chat-titulo').textContent = chatTexto(CHAT_TEXTOS.titulo);
}

document.addEventListener('DOMContentLoaded', chatMontarWidget);
