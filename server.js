require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 3000;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(cors()); // Libera acesso ao servidor de qualquer origem (como GitHub Pages)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Salva dados no arquivo db.json
function salvarDados(nome, numero) {
  const dados = { nome, numero, data: new Date().toISOString() };
  let db = [];
  if (fs.existsSync("db.json")) {
    db = JSON.parse(fs.readFileSync("db.json"));
  }
  db.push(dados);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
  return dados;
}

// Endpoint principal
app.post("/enviar", async (req, res) => {
  const { nome, numero } = req.body;

  console.log("📩 Requisição recebida:", req.body);

  if (!nome || !numero) {
    return res.status(400).json({ erro: "Nome e número são obrigatórios." });
  }

  // Envia para o bot do Telegram
  const msg = `📲 Novo cadastro no WiFire:\n👤 Nome: ${nome}\n📞 Número: ${numero}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const fetch = (await import("node-fetch")).default;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
      }),
    });

    salvarDados(nome, numero);
    return res.status(200).json({ sucesso: true });
  } catch (erro) {
    console.error("❌ Erro ao enviar mensagem para o Telegram:", erro);
    return res.status(500).json({ erro: "Erro ao enviar mensagem." });
  }
});

// Inicializa o servidor aceitando conexões externas
app.listen(port, "0.0.0.0", () => {
  console.log(`🌐 Servidor rodando em http://0.0.0.0:${port}`);
});
