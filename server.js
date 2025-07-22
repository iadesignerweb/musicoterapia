const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = 3000;

// Config Bot Telegram
const bot = new TelegramBot("SEU_TOKEN_AQUI", { polling: false });
const ADMIN_ID = "SEU_CHAT_ID";

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Rota para login com celular
app.post("/api/login", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Número inválido" });

  const db = JSON.parse(fs.readFileSync("db.json", "utf8"));
  const now = new Date().toISOString();
  db.push({ phone, timestamp: now });
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

  // Notificar no Telegram
  bot.sendMessage(ADMIN_ID, `📡 Novo cliente: ${phone}\n🕒 ${now}`);

  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
