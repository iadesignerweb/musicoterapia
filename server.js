const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

const TELEGRAM_TOKEN = "7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM";
const CHAT_ID = "@WiFireConectaBot"; // Substituir pelo chat_id se for grupo

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/enviar', async (req, res) => {
  const { nome, numero } = req.body;

  const mensagem = `🔥 Novo Cadastro no WiFire Conecta 🔥\n👤 Nome: ${nome}\n📱 Número: ${numero}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: mensagem }),
    });

    res.send('Cadastro enviado com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao enviar mensagem.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
