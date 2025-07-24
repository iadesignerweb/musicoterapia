const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Use seu token real aqui, mas NÃO exponha publicamente!
const TELEGRAM_TOKEN = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM';
const CHAT_ID = '@WiFireConecta'; // Ou o ID numérico do seu chat

// Middleware para aceitar dados JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rota principal
app.get('/', (req, res) => {
  res.send('🔥 Servidor WiFire ativo no Termux!');
});

// Rota para receber os dados do formulário
app.post('/webhook', async (req, res) => {
  const { nome, numero } = req.body;

  if (!nome || !numero) {
    return res.status(400).json({ error: 'Nome e número são obrigatórios.' });
  }

  const mensagem = `📶 Novo Cadastro WiFire:\n👤 Nome: ${nome}\n📱 Número: ${numero}`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: mensagem,
    });

    console.log('✅ Dados enviados com sucesso para o Telegram!');
    res.status(200).json({ status: 'ok', message: 'Dados recebidos com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao enviar para o Telegram:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao enviar mensagem para o Telegram.' });
  }
});

// Escuta todas as interfaces, inclusive IP dinâmico
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});
