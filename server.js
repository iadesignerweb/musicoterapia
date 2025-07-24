const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURAÇÕES DO TELEGRAM ===
const TELEGRAM_BOT_TOKEN = '7581940581:AAH35oxpMuNWt9BXhJVYn_ZpiRlTADEnSfM'; // Token do seu bot
const TELEGRAM_CHAT_ID = 'SEU_CHAT_ID_AQUI'; // Coloque aqui o seu chat_id (ID pessoal ou de grupo)

// === CONFIG DO SERVIDOR ===
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Pasta pública para HTML, CSS e JS

// === ENDPOINT DE CADASTRO ===
app.post('/cadastro', (req, res) => {
  const { nome, numero } = req.body;

  if (!nome || !numero) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const mensagem = `🚀 Novo Cadastro WiFire:\n👤 Nome: ${nome}\n📱 Número: ${numero}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(mensagem)}`;

  https.get(url, (telegramRes) => {
    if (telegramRes.statusCode === 200) {
      res.json({ message: 'Cadastro enviado com sucesso!' });
    } else {
      console.error(`Erro Telegram: Código ${telegramRes.statusCode}`);
      res.status(500).json({ error: 'Erro ao enviar para o Telegram.' });
    }
  }).on('error', (err) => {
    console.error('Erro de conexão com Telegram:', err);
    res.status(500).json({ error: 'Erro de conexão com o Telegram.' });
  });

  // Opcional: salvar localmente como backup
  const dados = { nome, numero, data: new Date().toISOString() };
  fs.appendFile('cadastros.json', JSON.stringify(dados) + ',\n', (err) => {
    if (err) console.error('Erro ao salvar local:', err);
  });
});

// === INICIAR SERVIDOR ===
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
