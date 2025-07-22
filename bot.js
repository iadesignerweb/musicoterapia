const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

const token = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM';
const bot = new TelegramBot(token, { polling: true });
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados simples
let users = [];
const dbPath = path.join(__dirname, 'db.json');

// Carregar db
if (fs.existsSync(dbPath)) {
  users = JSON.parse(fs.readFileSync(dbPath));
}

// Salvar db
function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

// Receber dados do formulário HTML
app.post('/enviar', (req, res) => {
  const numero = req.body.numero;
  if (!numero) return res.status(400).send('Número inválido.');

  // Salvar no DB
  const user = { numero, data: new Date().toISOString() };
  users.push(user);
  saveDB();

  // Enviar mensagem no Telegram
  bot.sendMessage(numero, `Olá! Você se conectou com sucesso ao WiFire Conecta.`);

  return res.send({ status: 'ok' });
});

// Bot escutando mensagens
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Bem-vindo ao WiFire Conecta, ${msg.from.first_name || 'usuário'}!`);
});

app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
