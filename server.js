const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Token do seu Bot do Telegram (já incluído)
const TELEGRAM_TOKEN = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM';
// ID do seu chat (pode ser um canal ou grupo privado)
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID'; // Substitua se quiser enviar para canal específico

app.use(bodyParser.json());

// Endpoint para receber dados do formulário
app.post('/webhook', async (req, res) => {
  const { nome, numero } = req.body;

  if (!nome || !numero) {
    return res.status(400).send({ error: 'Nome ou número ausente.' });
  }

  const mensagem = `📶 Novo acesso WiFire:\n\n👤 Nome: ${nome}\n📱 Número: ${numero}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown'
      })
    });

    res.status(200).send({ success: true });
  } catch (err) {
    console.error('Erro ao enviar para o Telegram:', err.message);
    res.status(500).send({ error: 'Erro ao enviar para o Telegram.' });
  }
});

// Rota de teste opcional
app.get('/', (req, res) => {
  res.send('🔥 Servidor WiFire Conecta está rodando!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ativo em http://localhost:${PORT}`);
});
