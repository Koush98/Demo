# Demo

## WhatsApp CSV report setup

The live screen sends the report through the Worker route:

```text
POST /api/send-whatsapp
```

Set these Cloudflare Worker secrets/variables before testing:

```text
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_TO=916290664570
WHATSAPP_GRAPH_VERSION=v23.0
```

Notes:

- `WHATSAPP_PHONE_NUMBER_ID` is the WhatsApp phone number ID from Meta, not the business account ID.
- `WHATSAPP_TO` must include country code and no `+`.
- The CSV file must be public. This project sends `/assets/reports/Madhushala_Sales_Report_Today.csv`.
- For a permanent token, create a Meta Business system user token with WhatsApp permissions and save it as `WHATSAPP_ACCESS_TOKEN`.
- If you are using Meta's test phone number, the recipient must be added in the WhatsApp API setup page.

Quick endpoint check after deployment:

```powershell
Invoke-RestMethod -Uri "https://snapkey-assistant.k-kbiswas8.workers.dev/api/send-whatsapp" -Method Post -ContentType "application/json" -Body '{"phoneNumber":"916290664570","message":"Madhushala POS sales report test","reportFileUrl":"/assets/reports/Madhushala_Sales_Report_Today.csv","reportFileName":"Madhushala_Sales_Report_Today.csv"}'
```
