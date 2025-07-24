require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Salva dados enviados no db.json
app.post('/dados', (req, res) => {
  const { nome, numero } = req.body;
  if (!nome || !numero) {
    return res.status(400).send('Nome e número são obrigatórios');
  }

  const dados = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  dados.push({ nome, numero, data: new Date().toISOString() });
  fs.writeFileSync('db.json', JSON.stringify(dados, null, 2));

  console.log(`✅ Novo usuário: ${nome} - ${numero}`);
  res.status(200).send('Dados recebidos com sucesso!');
});

// Porta do servidor (IP local detectado)
const PORT = 3000;
const IP_LOCAL = '192.168.0.106'; // <- SEU IP LOCAL DO `ifconfig`

app.listen(PORT, IP_LOCAL, () => {
  console.log(`🌐 Servidor rodando em http://${IP_LOCAL}:${PORT}`);
});
