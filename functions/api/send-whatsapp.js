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
  const reportFileUrl = String(payload.reportFileUrl || "").trim();
  const reportFileName = String(payload.reportFileName || "Madhushala_Sales_Report_Today.csv").trim();

  if (!to) return json({ error: "Recipient phone number is required." }, 400);
  if (!message) return json({ error: "Message is required." }, 400);

  const graphVersion = env.WHATSAPP_GRAPH_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${graphVersion}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const textResult = await sendWhatsApp(url, env.WHATSAPP_ACCESS_TOKEN, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: message
    }
  });

  if (!textResult.ok) {
    return json({ error: "WhatsApp text send failed.", details: textResult.body }, 502);
  }

  let documentResult = null;
  if (reportFileUrl) {
    const absoluteReportUrl = new URL(reportFileUrl, request.url).toString();
    documentResult = await sendWhatsApp(url, env.WHATSAPP_ACCESS_TOKEN, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "document",
      document: {
        link: absoluteReportUrl,
        filename: reportFileName,
        caption: "Madhushala POS sales report"
      }
    });

    if (!documentResult.ok) {
      return json({ error: "WhatsApp document send failed.", details: documentResult.body }, 502);
    }
  }

  return json({ ok: true, text: textResult.body, document: documentResult?.body || null });
}

async function sendWhatsApp(url, accessToken, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return {
    ok: response.ok,
    body: await response.json()
  };
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
