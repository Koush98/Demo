export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ error: "Telegram environment variables are not configured." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const message = String(payload.message || "").trim();
  if (!message) {
    return json({ error: "Message is required." }, 400);
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML"
    })
  });

  const result = await telegramResponse.json();
  if (!telegramResponse.ok || !result.ok) {
    return json({ error: "Telegram send failed.", details: result }, 502);
  }

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({ ok: true, service: "snapkey-telegram-report" });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
