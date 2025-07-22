const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// CREDENCIAIS DO BOT (substitua pelas reais!)
const BOT_TOKEN = '6382999891:AAEzO0Bz_MHEHAGoOeIhdFeqGZ-0xVcByMc';
const CHAT_ID = '@WiFireBot'; // Ou use o ID numérico

app.use(bodyParser.json());

// ROTA PRINCIPAL DE TESTE
app.get('/', (req, res) => {
  res.send('Servidor WiFireConecta rodando com sucesso!');
});

// ROTA POST /enviar
app.post('/enviar', async (req, res) => {
  const numero = req.body.numero;

  if (!numero) {
    return res.status(400).json({ error: 'Número é obrigatório!' });
  }

  const mensagem = `✅ Novo número cadastrado no WiFire Conecta: ${numero}`;

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: mensagem
    });

    res.json({ success: true, mensagem });
  } catch (err) {
    console.error('Erro ao enviar para o Telegram:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao enviar mensagem para o Telegram' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
