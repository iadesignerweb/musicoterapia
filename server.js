const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// CREDENCIAIS DO BOT DO TELEGRAM — já preenchidas como combinado
const BOT_TOKEN = '6382999891:AAEzO0Bz_MHEHAGoOeIhdFeqGZ-0xVcByMc';
const CHAT_ID = '@WiFireBot'; // OU coloque o número do seu chat_id

app.use(bodyParser.json());

// ROTA RAIZ (só para testar se o servidor está vivo)
app.get('/', (req, res) => {
  res.send('Servidor ativo!');
});

// ROTA /enviar — RECEBE O NÚMERO E ENVIA PARA O TELEGRAM
app.post('/enviar', async (req, res) => {
  const numero = req.body.numero;

  if (!numero) {
    return res.status(400).json({ error: 'Número é obrigatório!' });
  }

  const mensagem = `✅ Novo número cadastrado no WiFire Conecta: ${numero}`;

  try {
    const resposta = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: mensagem,
    });

    return res.status(200).json({
      success: true,
      mensagem: 'Enviado ao Telegram com sucesso!',
      telegram_response: resposta.data,
    });
  } catch (erro) {
    console.error('Erro ao enviar para Telegram:', erro.response?.data || erro.message);
    return res.status(500).json({ error: 'Falha ao enviar mensagem ao Telegram' });
  }
});

// INICIA O SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
