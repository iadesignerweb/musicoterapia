const { Telegraf } = require('telegraf');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const TELEGRAM_BOT_TOKEN = '7581940581:AAEQm0tnDnxPeAq9nxLTZhxqoMHEbwjCwmE';
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// --- Funções de Persistência de Dados ---
const DATA_FILES = {
  users: 'data/users.json',
  convs: 'data/convs.json'
};

function loadData(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Arquivo ${file} não encontrado. Criando novo.`);
      if (!fs.existsSync('data')) fs.mkdirSync('data');
      return [];
    }
    console.error(`Erro ao carregar o arquivo ${file}:`, err);
    return [];
  }
}

function saveData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Dados salvos com sucesso em ${file}`);
  } catch (err) {
    console.error(`ERRO CRÍTICO: Falha ao salvar o arquivo ${file}:`, err);
  }
}

let users = loadData(DATA_FILES.users);
let convs = loadData(DATA_FILES.convs);

// --- Lógica do Socket.IO para o Painel Web ---
io.on('connection', (socket) => {
  console.log('CLIENTE CONECTADO: ' + socket.id);

  socket.emit('users:update', users);
  socket.emit('convs:update', convs);

  socket.on('admin:message', async ({ convId, text }) => {
    console.log(`Mensagem do admin para o conv ${convId}: ${text}`);
    const conv = convs.find(c => c.id === convId);
    if (conv) {
      const msg = { from: 'admin', text, time: Date.now() };
      conv.messages.push(msg);
      conv.last = text;
      saveData(DATA_FILES.convs, convs);
      
      io.emit('message:new', { convId, from: 'admin', text, time: msg.time });

      try {
        await bot.telegram.sendMessage(conv.userId, text);
        console.log(`Mensagem enviada para o usuário ${conv.userId} no Telegram.`);
      } catch (e) {
        console.error(`Falha ao enviar mensagem para ${conv.userId} no Telegram:`, e);
      }
    }
  });

  socket.on('sync:request', () => {
    socket.emit('users:update', users);
    socket.emit('convs:update', convs);
  });

  socket.on('disconnect', () => {
    console.log('CLIENTE DESCONECTADO: ' + socket.id);
  });
});

// --- Lógica do Bot do Telegram ---
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  let conv = convs.find(c => c.userId === userId);
  
  if (!conv) {
    const user = users.find(u => u.id === userId);
    const nome = user ? user.nome : ctx.from.first_name || 'Usuário';

    conv = {
      id: Date.now(),
      userId,
      userName: nome,
      last: text,
      unread: 1,
      messages: []
    };
    convs.unshift(conv);
  } else {
    conv.last = text;
    conv.unread = (conv.unread || 0) + 1;
  }

  conv.messages.push({ from: 'user', text, time: Date.now() });
  saveData(DATA_FILES.convs, convs);

  io.emit('convs:update', convs);
  io.emit('message:new', { convId: conv.id, from: 'user', text, time: Date.now() });

  console.log(`Mensagem de ${userId}: ${text}`);
});

bot.start((ctx) => ctx.reply('Olá! Bot WiFire ativo. Use /register nome numero plano para cadastrar.'));

bot.command('register', (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) {
    return ctx.reply('Uso: /register nome numero plano');
  }
  const [nome, numero, plano] = args;
  const id = ctx.from.id;
  users.push({ id, nome, numero, plano, status: 'active', created: Date.now() });
  saveData(DATA_FILES.users, users);
  ctx.reply(`Usuário ${nome} cadastrado com sucesso!`);
  io.emit('users:update', users);
});

bot.launch();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO e Bot Telegram rodando na porta ${PORT}`);
});
