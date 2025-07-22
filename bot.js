const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const app = express();
const token = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM';

const bot = new TelegramBot(token, { polling: true });
const PORT = 3000;
const DB_FILE = 'db.json';

// Inicializa o arquivo db.json se não existir
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ usuarios: [] }, null, 2));
}

// Utilitário para salvar usuário no db.json
function salvarUsuario(numero, userId) {
  const db = JSON.parse(fs.readFileSync(DB_FILE));
  const existe = db.usuarios.find(u => u.numero === numero);

  if (!existe) {
    db.usuarios.push({
      numero,
      telegram_id: userId,
      data: new Date().toISOString()
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
}

// Mensagem de boas-vindas
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Bem-vindo ao WiFire Conecta!

Digite apenas seu número de celular para liberar o acesso à rede Wi-Fi.
Exemplo: 11988887777`);
});

// Captura do número de celular
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text;

  if (/^\d{10,13}$/.test(texto)) {
    salvarUsuario(texto, chatId);

    bot.sendMessage(chatId, `✅ Número registrado com sucesso!\nAguarde... você será redirecionado ou liberado para usar a rede.`);
    
    // Aqui você pode integrar com o front-end ou backend do sistema de hotspot
  }
});
