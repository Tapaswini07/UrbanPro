import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const app = express();
const port = Number(process.env.PORT || 3001);
const dataDirectory = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dataFile = path.join(dataDirectory, 'portal-store.json');

fs.mkdirSync(dataDirectory, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '{}');

app.use(express.json({ limit: '50mb' }));

const readStore = () => JSON.parse(fs.readFileSync(dataFile, 'utf8')) as Record<string, unknown>;

app.get('/api/portal-store/:key', (req, res) => {
  try {
    res.json({ value: readStore()[req.params.key] ?? null });
  } catch {
    res.status(500).json({ error: 'Failed to read portal data' });
  }
});

app.put('/api/portal-store/:key', (req, res) => {
  try {
    const store = readStore();
    store[req.params.key] = req.body.value;
    fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save portal data' });
  }
});

app.post('/api/whatsapp/enquiry', async (req, res) => {
  const {
    name,
    phone,
    email,
    movingDate,
    serviceType,
    items,
    movingFrom,
    movingTo,
  } = req.body || {};
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const recipientPhone = process.env.META_WHATSAPP_RECIPIENT_PHONE;
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME;
  const templateLanguage = process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';
  const graphVersion = process.env.META_WHATSAPP_GRAPH_VERSION || 'v22.0';

  if (!accessToken || !phoneNumberId || !recipientPhone || !templateName) {
    res.status(503).json({
      success: false,
      message: 'WhatsApp Cloud API is not configured on the server.',
    });
    return;
  }

  const bodyParameters = [
    name,
    phone,
    email || 'Not provided',
    movingDate || 'Not provided',
    serviceType || 'Not provided',
    items || 'Not provided',
    `${movingFrom || 'Not provided'} -> ${movingTo || 'Not provided'}`,
  ].map(value => ({ type: 'text', text: String(value || 'Not provided') }));

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: [{ type: 'body', parameters: bodyParameters }],
          },
        }),
      }
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('Meta WhatsApp API rejected enquiry', result);
      res.status(502).json({
        success: false,
        message: 'Meta WhatsApp rejected the enquiry.',
      });
      return;
    }
    res.json({ success: true, messageId: result?.messages?.[0]?.id || null });
  } catch (error) {
    console.error('Failed to send enquiry through Meta WhatsApp', error);
    res.status(502).json({
      success: false,
      message: 'Could not connect to Meta WhatsApp.',
    });
  }
});

const distDirectory = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDirectory)) app.use(express.static(distDirectory));
app.get('*', (_req, res) => {
  if (fs.existsSync(path.join(distDirectory, 'index.html'))) {
    res.sendFile(path.join(distDirectory, 'index.html'));
  } else {
    res.status(404).send('Run npm run build before npm start');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`UrbanPro portal server listening on http://localhost:${port}`);
});
