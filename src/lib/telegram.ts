/* Sendet eine Telegram-Nachricht an den konfigurierten Chat — für
   kundenrelevante Ereignisse (neue Leads, neue Abos). No-op, wenn
   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID nicht gesetzt sind (z. B. lokal).
   Schlägt nie hart fehl — Benachrichtigung darf den Hauptablauf nicht stören. */
export async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text, // Klartext (kein parse_mode) → keine HTML/Markdown-Injection
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[telegram] send failed:", err);
  }
}
