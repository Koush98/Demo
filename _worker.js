const DEFAULT_WHATSAPP_PHONE_NUMBER_ID = "1181224611746758";
const DEFAULT_WHATSAPP_GRAPH_VERSION = "v25.0";
const whatsappMessageStatuses = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/send-whatsapp") {
      if (request.method === "GET") {
        return json({
          ok: true,
          service: "snapkey-whatsapp-report",
          version: "whatsapp-debug-2026-07-15",
          runtime: whatsappRuntimeStatus(env)
        });
      }

      if (request.method !== "POST") {
        return json({ error: "Method not allowed." }, 405);
      }

      try {
        return await sendWhatsAppReport(request, env);
      } catch (error) {
        return json({
          error: "WhatsApp worker crashed.",
          message: error?.message || String(error)
        }, 500);
      }
    }

    if (url.pathname === "/api/whatsapp-webhook") {
      if (request.method === "GET") {
        return verifyWhatsAppWebhook(url, env);
      }

      if (request.method === "POST") {
        return receiveWhatsAppWebhook(request);
      }

      return json({ error: "Method not allowed." }, 405);
    }

    if (url.pathname === "/api/whatsapp-status") {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed." }, 405);
      }

      return getWhatsAppStatus(url);
    }

    return env.ASSETS.fetch(request);
  }
};

function verifyWhatsAppWebhook(url, env) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = getWhatsAppWebhookVerifyToken(env);

  if (mode === "subscribe" && token && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return json({
    error: "Webhook verification failed.",
    hasVerifyToken: Boolean(expectedToken),
    acceptedVariableNames: ["WHATSAPP_WEBHOOK_VERIFY_TOKEN", "WEBHOOK_VERIFY_TOKEN", "VERIFY_TOKEN"]
  }, 403);
}

async function receiveWhatsAppWebhook(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid webhook JSON body." }, 400);
  }

  const statuses = extractWhatsAppStatuses(payload);
  const messages = extractWhatsAppMessages(payload);

  statuses.forEach((status) => updateWhatsAppStatus(status));

  console.log("whatsapp-webhook", JSON.stringify({ statuses, messages }));

  return json({
    ok: true,
    received: {
      statuses: statuses.length,
      messages: messages.length
    },
    statuses
  });
}

function getWhatsAppStatus(url) {
  const to = String(url.searchParams.get("to") || "").replace(/\D/g, "");
  const records = Array.from(whatsappMessageStatuses.values())
    .filter((record) => !to || record.recipientId === to)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 12);

  return json({
    ok: true,
    records,
    summary: summarizeWhatsAppRecords(records)
  });
}

function rememberWhatsAppMessages(kind, result, recipientId) {
  (result?.messages || []).forEach((message) => {
    whatsappMessageStatuses.set(message.id, {
      id: message.id,
      kind,
      status: "accepted",
      recipientId,
      updatedAt: Date.now()
    });
  });
}

function updateWhatsAppStatus(status) {
  if (!status.id) return;

  const previous = whatsappMessageStatuses.get(status.id) || {};
  whatsappMessageStatuses.set(status.id, {
    ...previous,
    id: status.id,
    kind: previous.kind || "message",
    status: status.status || previous.status || "unknown",
    recipientId: status.recipientId || previous.recipientId || "",
    timestamp: status.timestamp || previous.timestamp,
    conversationId: status.conversationId || previous.conversationId,
    errorCode: status.errorCode || previous.errorCode,
    errorMessage: status.errorMessage || previous.errorMessage,
    updatedAt: Date.now()
  });
}

function summarizeWhatsAppRecords(records) {
  if (!records.length) return { status: "waiting", label: "Waiting for WhatsApp status" };
  if (records.some((record) => record.status === "failed")) return { status: "failed", label: "Failed" };
  if (records.some((record) => record.status === "read")) return { status: "read", label: "Read" };
  if (records.some((record) => record.status === "delivered")) return { status: "delivered", label: "Delivered" };
  if (records.some((record) => record.status === "sent")) return { status: "sent", label: "Sent" };
  return { status: "accepted", label: "Accepted by WhatsApp" };
}

function extractWhatsAppStatuses(payload) {
  return (payload?.entry || []).flatMap((entry) =>
    (entry?.changes || []).flatMap((change) =>
      (change?.value?.statuses || []).map((status) => ({
        id: status.id,
        status: status.status,
        recipientId: status.recipient_id,
        timestamp: status.timestamp,
        conversationId: status.conversation?.id,
        errorCode: status.errors?.[0]?.code,
        errorMessage: status.errors?.[0]?.message
      }))
    )
  );
}

function extractWhatsAppMessages(payload) {
  return (payload?.entry || []).flatMap((entry) =>
    (entry?.changes || []).flatMap((change) =>
      (change?.value?.messages || []).map((message) => ({
        id: message.id,
        from: message.from,
        type: message.type,
        timestamp: message.timestamp
      }))
    )
  );
}

async function sendWhatsAppReport(request, env) {
  const runtime = whatsappRuntimeStatus(env);
  if (!runtime.hasAccessToken || !runtime.hasPhoneNumberId) {
    return json({
      error: "WhatsApp environment variables are not configured.",
      runtime
    }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const to = String(payload.phoneNumber || env.WHATSAPP_TO || "").replace(/\D/g, "");
  const message = String(payload.message || "").trim();
  const reportFileUrl = String(payload.reportFileUrl || "").trim();
  const reportFileName = String(payload.reportFileName || "Madhushala_Sales_Report_Today.csv").trim();
  const absoluteReportUrl = reportFileUrl ? new URL(reportFileUrl, request.url).toString() : "";

  if (!to) return json({ error: "Recipient phone number is required." }, 400);
  if (!message) return json({ error: "Message is required." }, 400);

  const graphVersion = env.WHATSAPP_GRAPH_VERSION || DEFAULT_WHATSAPP_GRAPH_VERSION;
  const phoneNumberId = getWhatsAppPhoneNumberId(env);
  const graphUrl = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;
  const templateName = String(env.WHATSAPP_REPORT_TEMPLATE_NAME || payload.templateName || "").trim();

  if (templateName && absoluteReportUrl) {
    const templateResult = await sendWhatsApp(graphUrl, env.WHATSAPP_ACCESS_TOKEN, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: absoluteReportUrl,
                  filename: reportFileName
                }
              }
            ]
          }
        ]
      }
    });

    if (!templateResult.ok) {
      return json({ error: "WhatsApp report template send failed.", details: templateResult.body }, 502);
    }

    rememberWhatsAppMessages("report", templateResult.body, to);

    return json({ ok: true, mode: "document_template", template: templateResult.body });
  }

  const textResult = await sendWhatsApp(graphUrl, env.WHATSAPP_ACCESS_TOKEN, {
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
  rememberWhatsAppMessages("summary", textResult.body, to);

  let documentResult = null;
  if (reportFileUrl) {
    documentResult = await sendWhatsApp(graphUrl, env.WHATSAPP_ACCESS_TOKEN, {
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
    rememberWhatsAppMessages("report", documentResult.body, to);
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

  const responseText = await response.text();
  let responseBody;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = { raw: responseText };
  }

  return {
    ok: response.ok,
    status: response.status,
    body: responseBody
  };
}

function whatsappRuntimeStatus(env) {
  const phoneNumberId = getWhatsAppPhoneNumberId(env);
  return {
    hasAccessToken: Boolean(env.WHATSAPP_ACCESS_TOKEN),
    hasPhoneNumberId: Boolean(phoneNumberId),
    phoneNumberIdSource: env.WHATSAPP_PHONE_NUMBER_ID ? "env" : "fallback",
    hasRecipient: Boolean(env.WHATSAPP_TO),
    graphVersion: env.WHATSAPP_GRAPH_VERSION || DEFAULT_WHATSAPP_GRAPH_VERSION
  };
}

function getWhatsAppPhoneNumberId(env) {
  return env.WHATSAPP_PHONE_NUMBER_ID || env.PHONE_NUMBER_ID || env.WHATSAPP_PHONE_ID || DEFAULT_WHATSAPP_PHONE_NUMBER_ID;
}

function getWhatsAppWebhookVerifyToken(env) {
  return env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || env.WEBHOOK_VERIFY_TOKEN || env.VERIFY_TOKEN;
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
