class MockWhatsAppClient {
  async initialize() {
    console.log('[WhatsApp Mock] cliente iniciado (nenhuma conexão real com o WhatsApp).');
  }

  async isConnected() {
    return true;
  }

  async sendMessage(telefone, mensagem) {
    console.log(`[WhatsApp Mock] Para ${telefone}:\n${mensagem}\n`);
  }
}

module.exports = MockWhatsAppClient;
