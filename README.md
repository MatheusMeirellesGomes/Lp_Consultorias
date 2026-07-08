# LP Consultorias — Site Institucional

Site institucional completo da **LP Consultorias**, boutique internacional de assessoria estratégica, reputação e documentação profissional para processos internacionais.

Desenvolvido por **Matheus Meirelles Gomes**.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack e Ferramentas Utilizadas](#stack-e-ferramentas-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Fluxo de Notificações (E-mail / WhatsApp)](#fluxo-de-notificações-e-mail--whatsapp)
- [Internacionalização](#internacionalização)
- [Decisões de Design](#decisões-de-design)
- [Limitações Atuais e Próximos Passos](#limitações-atuais-e-próximos-passos)

---

## Visão Geral

O projeto substitui o site institucional em WordPress da LP Consultorias por uma aplicação própria, com:

- Site institucional (`home.html`) apresentando a empresa, serviços, metodologia, números e contato;
- Sistema de **login e cadastro reais**, com senha (hash bcrypt) e sessão via JWT — é a primeira tela que o visitante vê ao abrir o site;
- Opção de **"Entrar sem Cadastro"** para quem só quer navegar;
- **Assistente virtual** (chatbot por regras, sem custo de API) para tirar dúvidas frequentes;
- Botão de **WhatsApp com mensagem pronta**, replicando o padrão de contato do site em produção;
- Suporte a **4 idiomas**: Português, English, Español e Français;
- Fila de notificações (e-mail e WhatsApp) processada por um worker independente, para nunca travar o cadastro de um cliente por causa de um envio lento ou com falha.

## Funcionalidades

### Site institucional (`home.html`)
- Herói em tela cheia com foto real da Terra vista do espaço (Blue Marble, Apollo 17 — NASA, domínio público)
- Seção "Quem Somos", "O Que Fazemos" (4 serviços), "Nossa Metodologia" (4 etapas) e "Contato"
- Números de credibilidade (países atendidos, clientes atendidos, projetos realizados) em badges com ícones sólidos
- Animações de entrada e revelação de seções ao rolar a página
- Botão flutuante do assistente virtual (mascote robô)

### Login e Cadastro (`index.html` — página raiz do site)
- Abas de **Entrar** e **Criar Conta**, lado a lado com o painel da marca
- Cadastro cria conta de usuário (com senha) **e** registra o lead comercial, disparando as notificações de boas-vindas
- Login com JWT (7 dias de validade) e senha com hash bcrypt
- Quem já tem sessão ativa é redirecionado direto para a home ao acessar a tela de login
- "Entrar sem Cadastro" para navegação livre, sem criar conta

### Assistente virtual (chat)
- Baseado em regras (árvore de perguntas e respostas), sem depender de nenhuma API de IA paga
- Cobre dúvidas sobre serviços, metodologia, cadastro e direciona para o WhatsApp
- Funciona nos 4 idiomas suportados pelo site

### Notificações assíncronas
- Cadastro e formulário de contato **enfileiram** notificações em vez de enviá-las na hora
- Um processo separado (`worker`) processa essa fila a cada 5 segundos, com até 3 tentativas por envio
- Hoje o e-mail real depende de credenciais SMTP (ainda não configuradas) e o WhatsApp roda em modo simulado (Mock) — ambos ficam registrados no terminal do worker enquanto isso

## Stack e Ferramentas Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, CSS e JavaScript puros (sem framework) |
| Backend | Node.js + Express |
| Banco de dados | SQLite, gerenciado pelo **Prisma ORM** |
| Autenticação | JWT (`jsonwebtoken`) + hash de senha (`bcryptjs`) |
| E-mail | `nodemailer` (com fallback de log quando o SMTP não está configurado) |
| WhatsApp | Abstração própria (`IWhatsAppClient`), hoje com implementação Mock — pronta para plugar WPPConnect ou a API oficial da Meta futuramente |
| Fontes | Google Fonts — Cormorant Garamond (títulos) e Inter (texto) |
| Imagem do herói | Foto "Blue Marble" (Apollo 17 / NASA), domínio público |
| Ferramentas de desenvolvimento | Prisma Studio (visualização do banco), Prisma Migrate (versionamento do schema) |

Não há dependência de nenhuma API de IA paga — o assistente virtual do site é 100% baseado em regras.

## Estrutura do Projeto

```
Lima-Perrillo-Consulting/
├── prisma/
│   ├── schema.prisma          # Modelos: Usuario, Cliente, Contato, Notificacao
│   └── migrations/            # Histórico de migrações do banco
├── public/                    # Tudo que é servido ao navegador
│   ├── index.html             # Login / Criar Conta (página raiz do site)
│   ├── home.html              # Site institucional
│   ├── css/style.css          # Todo o CSS do site
│   ├── js/script.js           # Idiomas, formulários, autenticação, animações
│   ├── js/chat.js             # Assistente virtual
│   └── img/                   # Logo e foto da Terra
├── server/
│   ├── index.js               # App Express, rotas de cadastro/contato
│   ├── auth.js                 # Rotas de login e registro (JWT + bcrypt)
│   ├── db.js                   # Cliente Prisma
│   ├── mailer.js                # Envio de e-mail (nodemailer)
│   ├── templates.js             # Textos de e-mail/WhatsApp por evento
│   ├── queue.js                 # Enfileira notificações no banco
│   ├── worker.js                # Processa a fila de notificações
│   └── services/whatsapp/       # Abstração do cliente de WhatsApp (Mock hoje)
├── package.json
├── .env.example                # Modelo das variáveis de ambiente
└── README.md
```

## Como Rodar Localmente

Pré-requisitos: Node.js 18+ e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env conforme necessário (veja a seção abaixo)

# 3. Criar o banco de dados
npx prisma migrate deploy

# 4. Subir os processos (em terminais separados)
npm run dev          # site + API em http://localhost:3000
npm run dev:worker    # processa a fila de notificações

# 5. (opcional) Visualizar o banco de dados
npm run studio        # abre o Prisma Studio em http://localhost:5555
```

Acesse **http://localhost:3000** — a primeira tela será a de login/cadastro.

## Variáveis de Ambiente

Veja `.env.example` para a lista completa. As principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Caminho do banco SQLite (gerenciado pelo Prisma) |
| `JWT_SECRET` | Chave usada para assinar os tokens de login |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Credenciais de e-mail (ex.: Gmail com senha de app, SendGrid, Resend) |
| `ADMIN_EMAIL` | E-mail que recebe notificação de novos cadastros/contatos |
| `ADMIN_WHATSAPP` | WhatsApp que recebe notificação de novos cadastros/contatos |
| `WHATSAPP_MOCK` | `true` usa um cliente simulado; `false` exige uma implementação real |

## Banco de Dados

Modelos principais (`prisma/schema.prisma`):

- **Usuario** — contas de login (nome, e-mail, senha com hash)
- **Cliente** — leads capturados no cadastro (nome, e-mail, telefone, interesse, mensagem)
- **Contato** — mensagens enviadas pelo formulário de contato
- **Notificacao** — fila de e-mails/WhatsApp a enviar, com status e tentativas

## Fluxo de Notificações (E-mail / WhatsApp)

1. Cadastro ou contato salva o registro no banco e **enfileira** as notificações correspondentes (confirmação para o cliente + aviso para o admin)
2. O `worker` (processo separado) busca itens pendentes a cada 5 segundos e tenta enviá-los
3. Em caso de falha, tenta novamente até 3 vezes antes de marcar como erro
4. Enquanto SMTP/WhatsApp reais não estiverem configurados, tudo aparece simulado no console do worker

Essa arquitetura (fila + worker) evita que uma falha de envio trave o cadastro do cliente.

## Internacionalização

O site é totalmente traduzido em **Português, English, Español e Français**, incluindo o assistente virtual. A troca de idioma é feita via JavaScript (`data-lang` em cada elemento) e persiste entre páginas via `localStorage`.

## Decisões de Design

- **Paleta de cores** (branco `#F2F1EF`, verde `#042D2F`, dourado `#B58C5E`) e tipografia (Cormorant Garamond + Inter) extraídas diretamente do site em produção da LP Consultorias, para manter consistência de marca.
- **Sem frameworks de frontend** — HTML/CSS/JS puros, por simplicidade de manutenção.
- **Sem fotos de terceiros com direitos autorais incertos** — a única foto do site (Terra vista do espaço) é de domínio público (NASA/Apollo 17).
- **Assistente por regras, não IA paga** — evita custo recorrente de API enquanto o site ainda está em fase inicial.

## Limitações Atuais e Próximos Passos

- WhatsApp ainda roda em modo simulado (Mock) — falta plugar uma integração real (WPPConnect ou API oficial da Meta)
- E-mail depende de credenciais SMTP reais, ainda não configuradas
- Não há uma área logada com conteúdo próprio para o cliente (hoje o login só libera a navegação, sem um painel de acompanhamento)
- O site ainda não foi implantado em um servidor de produção (roda apenas localmente)
