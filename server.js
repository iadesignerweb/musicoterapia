const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// Credenciais reais (conforme combinado)
const token = '6867861914:AAGuSqPbBQuZVmCy1k59z5DZTOKLPOODkn0';
const chatId = 5939797000;

const bot = new TelegramBot(token);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/enviar', (req, res) => {
  const numero = req.body.numero;
  if (!numero) {
    return res.status(400).send('Número não fornecido.');
  }

  const mensagem = `📲 Novo número cadastrado no WiFire Conecta:\n\nNúmero: ${numero}`;
  bot.sendMessage(chatId, mensagem);
  res.send('✅ Número enviado com sucesso para o Telegram!');
});

app.listen(3000, () => {
  console.log('🚀 Servidor ativo: http://localhost:3000');
});
