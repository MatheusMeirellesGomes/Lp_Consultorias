const MockWhatsAppClient = require('./MockWhatsAppClient');

// Contrato esperado por qualquer implementação (Mock hoje, WPPConnect/API oficial no futuro):
//   initialize(): Promise<void>
//   isConnected(): Promise<boolean>
//   sendMessage(telefone: string, mensagem: string): Promise<void>

let instance;

function getWhatsAppClient() {
  if (!instance) {
    if (process.env.WHATSAPP_MOCK === 'false') {
      throw new Error(
        'WHATSAPP_MOCK=false, mas nenhuma implementação real de WhatsApp foi configurada ainda.'
      );
    }
    instance = new MockWhatsAppClient();
  }
  return instance;
}

module.exports = { getWhatsAppClient };
