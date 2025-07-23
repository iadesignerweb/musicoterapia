require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('WiFire Bot iniciado com sucesso!'));
bot.launch();

// Endpoint para receber mensagens do frontend
app.post('/send', async (req, res) => {
  const { message } = req.body;
  try {
    await bot.telegram.sendMessage(process.env.CHAT_ID, `Nova mensagem: ${message}`);
    res.status(200).send({ status: 'Enviado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: 'Erro ao enviar mensagem.' });
  }
});

app.listen(3000, () => {
  console.log('🌐 Servidor rodando em http://localhost:3000');
});
