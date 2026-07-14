export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return json({ error: "WhatsApp environment variables are not configured." }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const to = String(env.WHATSAPP_TO || payload.phoneNumber || "").replace(/\D/g, "");
  const message = String(payload.message || "").trim();

  if (!to) return json({ error: "Recipient phone number is required." }, 400);
  if (!message) return json({ error: "Message is required." }, 400);

  const graphVersion = env.WHATSAPP_GRAPH_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${graphVersion}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const whatsappResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    })
  });

  const result = await whatsappResponse.json();
  if (!whatsappResponse.ok) {
    return json({ error: "WhatsApp send failed.", details: result }, 502);
  }

  return json({ ok: true, result });
}

export async function onRequestGet() {
  return json({ ok: true, service: "snapkey-whatsapp-report" });
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
