const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/enviar", async (req, res) => {
  const { nome, numero } = req.body;

  if (!nome || !numero) return res.send("Preencha todos os campos.");

  const mensagem = `📲 Novo cadastro no WiFire:\n\n👤 Nome: ${nome}\n📞 Número: ${numero}`;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem
      })
    });

    res.send("Dados enviados com sucesso!");
  } catch (erro) {
    console.error("Erro ao enviar:", erro);
    res.send("Erro ao enviar mensagem.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
