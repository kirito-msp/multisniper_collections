// index.js

const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const PORT = 7777;

// ─── CONFIG ────────────────────────────────────────────────────────────────
// List your bot tokens here
const botTokens = [
  'YOUR TELEGRAM BOT TOKEN',
  'YOUR TELEGRAM BOT TOKEN',
  'YOUR TELEGRAM BOT TOKEN',
  'YOUR TELEGRAM BOT TOKEN',
  'YOUR TELEGRAM BOT TOKEN',
  'YOUR TELEGRAM BOT TOKEN'
];

// ─── ROTATION STATE ───────────────────────────────────────────────────────
const bots = botTokens.map(token => new Telegraf(token));
let botIndex = 0;
function getNextBot() {
  const bot = bots[botIndex];
  botIndex = (botIndex + 1) % bots.length;
  return bot;
}

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));

// ─── /send ENDPOINT ────────────────────────────────────────────────────────
/**
 * POST /send
 * {
 *   chatId: number|string,
 *   topicId?: number,
 *   text: string,
 *   parse_mode?: 'Markdown'|'HTML',
 *   disable_web_page_preview?: boolean,
 *   reply_markup?: object,
 *   // any other sendMessage opts
 * }
 */
app.post('/send', async (req, res) => {
  const { chatId, topicId, ...opts } = req.body;

  if (!chatId || !opts.text) {
    return res.status(400).json({ error: 'Required fields: chatId, text' });
  }

  const bot = getNextBot();
  const sendOpts = { ...opts };
  if (topicId) sendOpts.message_thread_id = topicId;

  try {
    const result = await bot.telegram.sendMessage(chatId, opts.text, sendOpts);
    res.json({
      ok:      true,
      botUsed: botTokens[botIndex === 0 ? bots.length - 1 : botIndex - 1],
      result
    });
  } catch (err) {
    console.error('Telegram error:', err.response?.description || err.message);
    res.status(502).json({
      error:   'Failed to send message',
      details: err.response?.description || err.message
    });
  }
});

// ─── START SERVER ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Telegram-rotator listening on http://localhost:${PORT}`);
  console.log(`→ Bots in rotation: ${bots.length}`);
});
