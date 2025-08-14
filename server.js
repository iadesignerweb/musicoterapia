const { Telegraf } = require('telegraf');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

require('dotenv').config(); // Adicione esta linha para carregar o arquivo .env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // O token será lido daqui

if (!TELEGRAM_BOT_TOKEN) {
    console.error("ERRO: Token do Telegram não encontrado. Certifique-se de que o arquivo .env está configurado.");
    process.exit(1);
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ... (o restante do código é o mesmo)

// Adicione esta nova função para carregar o arquivo .env
bot.launch();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e Bot Telegram rodando na porta ${PORT}`);
});

