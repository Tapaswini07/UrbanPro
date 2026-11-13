import express, { type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import 'dotenv/config';

const app = express();
const port = Number(process.env.PORT || 3001);
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

const PORTAL_COLLECTIONS = new Set([
  'upl_quote_requests',
  'upl_surveys',
  'upl_quotations',
  'upl_packing_lists',
  'upl_bilties',
  'upl_bills',
  'upl_money_receipts',
  'upl_vouchers',
  'upl_car_conditions',
  'upl_bike_conditions',
  'upl_company_profile',
  'upl_global_signature',
  'upl_company_signature',
]);
const portalSubscribers = new Set<Response>();

let schemaPromise: Promise<void> | null = null;

async function ensureDatabase(): Promise<void> {
  if (!pool) throw new Error('DATABASE_URL is not configured.');
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS portal_collections (
        collection_key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS portal_collections_updated_at_idx
        ON portal_collections (updated_at DESC);
    `).then(() => undefined);
  }
  return schemaPromise;
}

app.use(express.json({ limit: '50mb' }));

function broadcastCollectionChange(key: string): void {
  const message = `event: collection\ndata: ${JSON.stringify({ key })}\n\n`;
  for (const subscriber of portalSubscribers) subscriber.write(message);
}

app.get('/api/health', (_req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      await pool!.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      console.error('PostgreSQL health check failed', error);
      res.status(503).json({ status: 'unavailable', database: 'disconnected' });
    }
  })();
});

app.get('/api/portal-store/events', (req, res) => {
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write('event: connected\ndata: {}\n\n');
  portalSubscribers.add(res);
  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25_000);
  req.on('close', () => {
    clearInterval(heartbeat);
    portalSubscribers.delete(res);
  });
});

app.get('/api/portal-store/:key', (req, res) => {
  void (async () => {
    const key = req.params.key;
    if (!PORTAL_COLLECTIONS.has(key)) {
      res.status(400).json({ error: 'Unsupported portal collection.' });
      return;
    }
    try {
      await ensureDatabase();
      const result = await pool!.query(
        'SELECT value, updated_at FROM portal_collections WHERE collection_key = $1',
        [key]
      );
      res.json({ value: result.rows[0]?.value ?? null, updatedAt: result.rows[0]?.updated_at ?? null });
    } catch (error) {
      console.error(`Failed to read PostgreSQL collection ${key}`, error);
      res.status(503).json({ error: 'PostgreSQL database is unavailable.' });
    }
  })();
});

app.put('/api/portal-store/:key', (req, res) => {
  void (async () => {
    const key = req.params.key;
    if (!PORTAL_COLLECTIONS.has(key)) {
      res.status(400).json({ error: 'Unsupported portal collection.' });
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'value')) {
      res.status(400).json({ error: 'A collection value is required.' });
      return;
    }
    try {
      await ensureDatabase();
      const result = await pool!.query(
        `INSERT INTO portal_collections (collection_key, value)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (collection_key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
         RETURNING updated_at`,
        [key, JSON.stringify(req.body.value)]
      );
      broadcastCollectionChange(key);
      res.json({ success: true, updatedAt: result.rows[0].updated_at });
    } catch (error) {
      console.error(`Failed to save PostgreSQL collection ${key}`, error);
      res.status(503).json({ error: 'PostgreSQL database is unavailable.' });
    }
  })();
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
