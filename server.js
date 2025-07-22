const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = 3000;

// ✅ TOKEN DO BOT E CHAT_ID conforme sua autorização
const BOT_TOKEN = "6696481505:AAEJa-rEOzF5i8iJKJwID7yxWlxMKGLlZNY";
const CHAT_ID = "5287458186"; // Substituído com base em sua autorização

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

app.use(cors());
app.use(bodyParser.json());

// Armazenamento temporário dos acessos
let acessos = [];

// 📲 Endpoint de registro de número
app.post("/send", (req, res) => {
  const { numero } = req.body;

  if (!numero || typeof numero !== "string") {
    return res.status(400).json({ erro: "Número inválido" });
  }

  const dataHora = new Date().toLocaleString("pt-BR");
  const registro = { numero, data: dataHora };

  acessos.push(registro);

  // Envio da mensagem via Telegram
  const mensagem = `📶 Novo Acesso WiFire Conecta\n📱 Número: ${numero}\n🕓 Data: ${dataHora}`;
  bot.sendMessage(CHAT_ID, mensagem);

  res.status(200).json({ sucesso: true, mensagem: "Número registrado com sucesso." });
});

// 📊 Endpoint para o Dashboard visualizar acessos recentes
app.get("/acessos", (req, res) => {
  const ultimos = acessos.slice(-30).reverse(); // Últimos 30 acessos
  res.json(ultimos);
});

// 🌐 Servir arquivos do front-end
app.use(express.static("public")); // dashboard.html deve estar dentro da pasta /public

// 🔥 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ativo em http://localhost:${PORT}`);
});
