import express, { type Response } from 'express';
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';
import 'dotenv/config';

// ----------------------------------------------------
// DNS Fallback for AWS Neon Serverless PostgreSQL
// ----------------------------------------------------
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const origLookup = dns.lookup;
  dns.lookup = ((hostname: string, options: any, callback: any) => {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'function' ? {} : options;
    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        if (opts && opts.all) {
          return cb(null, addresses.map(a => ({ address: a, family: 4 })));
        }
        return cb(null, addresses[0], 4);
      }
      origLookup(hostname, opts, cb);
    });
  }) as typeof dns.lookup;
} catch (dnsErr) {
  console.warn('Custom DNS resolver fallback notice:', dnsErr);
}

const app = express();
const port = Number(process.env.PORT || 3001);
const defaultDatabaseUrl =
  'postgresql://neondb_owner:npg_2URJSVlsYI0C@ep-curly-surf-aoqv4jle-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

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
    schemaPromise = (async () => {
      // 1. Ensure core collections table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS portal_collections (
          collection_key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS portal_collections_updated_at_idx
          ON portal_collections (updated_at DESC);
      `);

      // 2. Ensure individual relational module tables
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        try {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await pool.query(sql);
        } catch (schemaErr) {
          console.warn('Note on schema.sql execution:', schemaErr);
        }
      }
    })();
  }
  return schemaPromise;
}

// CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '50mb' }));

function broadcastCollectionChange(key: string): void {
  const message = `event: collection\ndata: ${JSON.stringify({ key })}\n\n`;
  for (const subscriber of portalSubscribers) {
    try {
      subscriber.write(message);
    } catch {
      portalSubscribers.delete(subscriber);
    }
  }
}

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (_req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      await pool!.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      console.error('PostgreSQL health check failed', error);
      res.status(503).json({ status: 'unavailable', database: 'disconnected', error: String(error) });
    }
  })();
});

// ----------------------------------------------------
// Server-Sent Events (SSE) for Real-Time Updates
// ----------------------------------------------------
app.get('/api/portal-store/events', (req, res) => {
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write('event: connected\ndata: {}\n\n');
  portalSubscribers.add(res);
  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(heartbeat);
      portalSubscribers.delete(res);
    }
  }, 25_000);
  req.on('close', () => {
    clearInterval(heartbeat);
    portalSubscribers.delete(res);
  });
});

// ----------------------------------------------------
// Synchronize Collection changes into Relational Tables
// ----------------------------------------------------
async function syncCollectionToTables(key: string, value: unknown): Promise<void> {
  if (!pool) return;
  try {
    if (key === 'upl_quote_requests' && Array.isArray(value)) {
      for (const item of value) {
        if (!item || !item.id) continue;
        await pool.query(
          `INSERT INTO enquiries (
            id, name, phone, email, moving_from, moving_to, moving_date, service_type,
            items, item_rows, message, whatsapp_url, status, admin_notes, email_delivered, submitted_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16, NOW())
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            admin_notes = EXCLUDED.admin_notes,
            email_delivered = EXCLUDED.email_delivered,
            updated_at = NOW()`,
          [
            String(item.id),
            String(item.name || ''),
            String(item.phone || ''),
            item.email ? String(item.email) : null,
            item.movingFrom ? String(item.movingFrom) : null,
            item.movingTo ? String(item.movingTo) : null,
            item.movingDate ? String(item.movingDate) : null,
            item.serviceType || item.item ? String(item.serviceType || item.item) : null,
            item.items ? String(item.items) : null,
            JSON.stringify(item.itemRows || []),
            item.message ? String(item.message) : null,
            item.whatsappUrl ? String(item.whatsappUrl) : null,
            String(item.status || 'New'),
            String(item.adminNotes || ''),
            Boolean(item.emailDelivered),
            item.submittedAt ? new Date(item.submittedAt) : new Date(),
          ]
        );
      }
    } else if (key === 'upl_surveys' && Array.isArray(value)) {
      for (const s of value) {
        if (!s || !s.id) continue;
        await pool.query(
          `INSERT INTO surveys (
            id, survey_no, survey_date, party_name, mobile_no, email, packing_date,
            delivery_date, from_city, to_city, items, advance_pay, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            survey_no = EXCLUDED.survey_no,
            survey_date = EXCLUDED.survey_date,
            party_name = EXCLUDED.party_name,
            mobile_no = EXCLUDED.mobile_no,
            email = EXCLUDED.email,
            packing_date = EXCLUDED.packing_date,
            delivery_date = EXCLUDED.delivery_date,
            from_city = EXCLUDED.from_city,
            to_city = EXCLUDED.to_city,
            items = EXCLUDED.items,
            advance_pay = EXCLUDED.advance_pay,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(s.id),
            String(s.surveyNo || ''),
            String(s.surveyDate || ''),
            String(s.partyName || ''),
            String(s.mobileNo || ''),
            s.email ? String(s.email) : null,
            s.packingDate ? String(s.packingDate) : null,
            s.dateOfDelivery ? String(s.dateOfDelivery) : null,
            s.fromCity ? String(s.fromCity) : null,
            s.toCity ? String(s.toCity) : null,
            JSON.stringify(s.items || []),
            s.advancePay ? String(s.advancePay) : null,
            JSON.stringify(s),
          ]
        );
      }
    } else if (key === 'upl_quotations' && Array.isArray(value)) {
      for (const q of value) {
        if (!q || !q.id) continue;
        await pool.query(
          `INSERT INTO quotations (
            id, quotation_no, quotation_date, party_name, mobile_no, email, net_amount, total_amount, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            quotation_no = EXCLUDED.quotation_no,
            quotation_date = EXCLUDED.quotation_date,
            party_name = EXCLUDED.party_name,
            mobile_no = EXCLUDED.mobile_no,
            email = EXCLUDED.email,
            net_amount = EXCLUDED.net_amount,
            total_amount = EXCLUDED.total_amount,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(q.id),
            String(q.quotationNo || ''),
            String(q.quotationDate || ''),
            String(q.partyName || ''),
            String(q.mobileNo || ''),
            q.email ? String(q.email) : null,
            q.netAmount ? String(q.netAmount) : null,
            q.totalAmount ? String(q.totalAmount) : null,
            JSON.stringify(q),
          ]
        );
      }
    } else if (key === 'upl_packing_lists' && Array.isArray(value)) {
      for (const p of value) {
        if (!p || !p.id) continue;
        await pool.query(
          `INSERT INTO packing_lists (
            id, packing_list_no, packing_date, party_name, mobile_no, total_items, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            packing_list_no = EXCLUDED.packing_list_no,
            packing_date = EXCLUDED.packing_date,
            party_name = EXCLUDED.party_name,
            mobile_no = EXCLUDED.mobile_no,
            total_items = EXCLUDED.total_items,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(p.id),
            String(p.packingListNo || ''),
            String(p.packingDate || ''),
            String(p.partyName || ''),
            String(p.mobileNo || ''),
            Array.isArray(p.items) ? p.items.length : 0,
            JSON.stringify(p),
          ]
        );
      }
    } else if (key === 'upl_bilties' && Array.isArray(value)) {
      for (const b of value) {
        if (!b || !b.id) continue;
        await pool.query(
          `INSERT INTO bilties (
            id, bilty_no, bilty_date, consignor_name, consignor_mobile, consignee_name, consignee_mobile,
            from_city, to_city, truck_no, total_freight, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            bilty_no = EXCLUDED.bilty_no,
            bilty_date = EXCLUDED.bilty_date,
            consignor_name = EXCLUDED.consignor_name,
            consignor_mobile = EXCLUDED.consignor_mobile,
            consignee_name = EXCLUDED.consignee_name,
            consignee_mobile = EXCLUDED.consignee_mobile,
            from_city = EXCLUDED.from_city,
            to_city = EXCLUDED.to_city,
            truck_no = EXCLUDED.truck_no,
            total_freight = EXCLUDED.total_freight,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(b.id),
            String(b.biltyNo || ''),
            String(b.biltyDate || ''),
            String(b.consignorName || ''),
            String(b.consignorMobile || ''),
            String(b.consigneeName || ''),
            String(b.consigneeMobile || ''),
            String(b.fromCity || ''),
            String(b.toCity || ''),
            String(b.truckNo || ''),
            String(b.freightCharges || ''),
            JSON.stringify(b),
          ]
        );
      }
    } else if (key === 'upl_bills' && Array.isArray(value)) {
      for (const bill of value) {
        if (!bill || !bill.id) continue;
        await pool.query(
          `INSERT INTO bills (
            id, bill_no, bill_date, party_name, mobile_no, total_amount, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            bill_no = EXCLUDED.bill_no,
            bill_date = EXCLUDED.bill_date,
            party_name = EXCLUDED.party_name,
            mobile_no = EXCLUDED.mobile_no,
            total_amount = EXCLUDED.total_amount,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(bill.id),
            String(bill.billNo || ''),
            String(bill.billDate || ''),
            String(bill.partyName || ''),
            String(bill.mobileNo || ''),
            String(bill.totalAmount || ''),
            JSON.stringify(bill),
          ]
        );
      }
    } else if (key === 'upl_money_receipts' && Array.isArray(value)) {
      for (const mr of value) {
        if (!mr || !mr.id) continue;
        await pool.query(
          `INSERT INTO money_receipts (
            id, receipt_no, receipt_date, received_from, mobile_no, amount, payment_mode, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            receipt_no = EXCLUDED.receipt_no,
            receipt_date = EXCLUDED.receipt_date,
            received_from = EXCLUDED.received_from,
            mobile_no = EXCLUDED.mobile_no,
            amount = EXCLUDED.amount,
            payment_mode = EXCLUDED.payment_mode,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(mr.id),
            String(mr.receiptNo || ''),
            String(mr.receiptDate || ''),
            String(mr.receivedFrom || ''),
            String(mr.mobileNo || ''),
            String(mr.amount || ''),
            String(mr.paymentMode || ''),
            JSON.stringify(mr),
          ]
        );
      }
    } else if (key === 'upl_vouchers' && Array.isArray(value)) {
      for (const v of value) {
        if (!v || !v.id) continue;
        await pool.query(
          `INSERT INTO payment_vouchers (
            id, voucher_no, voucher_date, paid_to, amount, debit_head, payment_mode, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            voucher_no = EXCLUDED.voucher_no,
            voucher_date = EXCLUDED.voucher_date,
            paid_to = EXCLUDED.paid_to,
            amount = EXCLUDED.amount,
            debit_head = EXCLUDED.debit_head,
            payment_mode = EXCLUDED.payment_mode,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(v.id),
            String(v.voucherNo || ''),
            String(v.voucherDate || ''),
            String(v.paidTo || ''),
            String(v.amount || ''),
            String(v.debitHead || ''),
            String(v.paymentMode || ''),
            JSON.stringify(v),
          ]
        );
      }
    } else if (key === 'upl_car_conditions' && Array.isArray(value)) {
      for (const car of value) {
        if (!car || !car.id) continue;
        await pool.query(
          `INSERT INTO car_conditions (
            id, report_no, date, owner_name, mobile_no, car_make_model, reg_no, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            report_no = EXCLUDED.report_no,
            date = EXCLUDED.date,
            owner_name = EXCLUDED.owner_name,
            mobile_no = EXCLUDED.mobile_no,
            car_make_model = EXCLUDED.car_make_model,
            reg_no = EXCLUDED.reg_no,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(car.id),
            String(car.reportNo || ''),
            String(car.date || ''),
            String(car.ownerName || ''),
            String(car.mobileNo || ''),
            String(car.carMakeModel || ''),
            String(car.regNo || ''),
            JSON.stringify(car),
          ]
        );
      }
    } else if (key === 'upl_bike_conditions' && Array.isArray(value)) {
      for (const bike of value) {
        if (!bike || !bike.id) continue;
        await pool.query(
          `INSERT INTO bike_conditions (
            id, report_no, date, owner_name, mobile_no, bike_make_model, reg_no, raw_data, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET
            report_no = EXCLUDED.report_no,
            date = EXCLUDED.date,
            owner_name = EXCLUDED.owner_name,
            mobile_no = EXCLUDED.mobile_no,
            bike_make_model = EXCLUDED.bike_make_model,
            reg_no = EXCLUDED.reg_no,
            raw_data = EXCLUDED.raw_data,
            updated_at = NOW()`,
          [
            String(bike.id),
            String(bike.reportNo || ''),
            String(bike.date || ''),
            String(bike.ownerName || ''),
            String(bike.mobileNo || ''),
            String(bike.bikeMakeModel || ''),
            String(bike.regNo || ''),
            JSON.stringify(bike),
          ]
        );
      }
    } else if (key === 'upl_company_profile' && value && typeof value === 'object') {
      await pool.query(
        `INSERT INTO company_profile (id, profile_data, updated_at)
         VALUES ('default', $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET profile_data = EXCLUDED.profile_data, updated_at = NOW()`,
        [JSON.stringify(value)]
      );
    } else if (key === 'upl_global_signature' || key === 'upl_company_signature') {
      await pool.query(
        `INSERT INTO app_settings (id, updated_at)
         VALUES ('default', NOW())
         ON CONFLICT (id) DO NOTHING`
      );
      if (key === 'upl_global_signature') {
        await pool.query(
          `UPDATE app_settings SET global_signature = $1::jsonb, updated_at = NOW() WHERE id = 'default'`,
          [JSON.stringify(value)]
        );
      } else {
        await pool.query(
          `UPDATE app_settings SET company_signature = $1, updated_at = NOW() WHERE id = 'default'`,
          [String(value || '')]
        );
      }
    }
  } catch (syncErr) {
    console.error(`Error syncing collection ${key} to relational tables:`, syncErr);
  }
}

// ----------------------------------------------------
// Generic Portal Collection Endpoints
// ----------------------------------------------------
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
      let val = result.rows[0]?.value ?? null;
      if (key === 'upl_quote_requests' && (!val || (Array.isArray(val) && val.length === 0))) {
        // Fall back to enquiries table if portal_collections is empty
        const enqRes = await pool!.query(`
          SELECT
            id, name, phone, email, moving_from as "movingFrom", moving_to as "movingTo",
            moving_date as "movingDate", service_type as "serviceType", items, item_rows as "itemRows",
            message, whatsapp_url as "whatsappUrl", status, admin_notes as "adminNotes",
            email_delivered as "emailDelivered", submitted_at as "submittedAt"
          FROM enquiries
          ORDER BY submitted_at DESC
        `);
        if (enqRes.rows.length > 0) {
          val = enqRes.rows;
        }
      }
      res.json({ value: val, updatedAt: result.rows[0]?.updated_at ?? null });
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

      // Async sync to relational table
      void syncCollectionToTables(key, req.body.value);

      broadcastCollectionChange(key);
      res.json({ success: true, updatedAt: result.rows[0].updated_at });
    } catch (error) {
      console.error(`Failed to save PostgreSQL collection ${key}`, error);
      res.status(503).json({ error: 'PostgreSQL database is unavailable.' });
    }
  })();
});

// ----------------------------------------------------
// Dedicated Enquiries API
// ----------------------------------------------------
app.post('/api/enquiries', (req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      const body = req.body || {};
      const enquiryId = body.id || `ENQ-${Date.now().toString().slice(-6)}`;
      const now = new Date();

      const newEnquiry = {
        id: enquiryId,
        name: body.name || 'Anonymous Client',
        phone: body.phone || '',
        email: body.email || '',
        movingFrom: body.movingFrom || '',
        movingTo: body.movingTo || '',
        movingDate: body.movingDate || body.date || '',
        serviceType: body.serviceType || body.item || '',
        item: body.item || body.serviceType || '',
        items: body.items || '',
        itemRows: body.itemRows || [],
        message: body.message || '',
        whatsappUrl: body.whatsappUrl || '',
        status: body.status || 'New',
        adminNotes: body.adminNotes || '',
        emailDelivered: Boolean(body.emailDelivered),
        submittedAt: body.submittedAt || now.toISOString(),
      };

      // 1. Insert into dedicated enquiries table
      await pool!.query(
        `INSERT INTO enquiries (
          id, name, phone, email, moving_from, moving_to, moving_date, service_type,
          items, item_rows, message, whatsapp_url, status, admin_notes, email_delivered, submitted_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          status = EXCLUDED.status,
          admin_notes = EXCLUDED.admin_notes,
          email_delivered = EXCLUDED.email_delivered,
          updated_at = NOW()`,
        [
          newEnquiry.id,
          newEnquiry.name,
          newEnquiry.phone,
          newEnquiry.email || null,
          newEnquiry.movingFrom || null,
          newEnquiry.movingTo || null,
          newEnquiry.movingDate || null,
          newEnquiry.serviceType || null,
          newEnquiry.items || null,
          JSON.stringify(newEnquiry.itemRows || []),
          newEnquiry.message || null,
          newEnquiry.whatsappUrl || null,
          newEnquiry.status,
          newEnquiry.adminNotes,
          newEnquiry.emailDelivered,
          newEnquiry.submittedAt,
        ]
      );

      // 2. Prepend to upl_quote_requests in portal_collections
      const existing = await pool!.query(
        `SELECT value FROM portal_collections WHERE collection_key = 'upl_quote_requests'`
      );
      let list: any[] = [];
      if (existing.rows[0]?.value && Array.isArray(existing.rows[0].value)) {
        list = existing.rows[0].value.filter((e: any) => e.id !== newEnquiry.id);
      }
      list.unshift(newEnquiry);
      if (list.length > 500) list = list.slice(0, 500);

      await pool!.query(
        `INSERT INTO portal_collections (collection_key, value)
         VALUES ('upl_quote_requests', $1::jsonb)
         ON CONFLICT (collection_key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [JSON.stringify(list)]
      );

      // 3. Broadcast real-time event to all listening admin screens
      broadcastCollectionChange('upl_quote_requests');

      res.status(201).json({ success: true, enquiry: newEnquiry });
    } catch (error) {
      console.error('Failed to save enquiry to PostgreSQL:', error);
      res.status(500).json({ success: false, error: 'Database error saving enquiry.' });
    }
  })();
});

app.get('/api/enquiries', (_req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      const result = await pool!.query(`
        SELECT
          id, name, phone, email, moving_from as "movingFrom", moving_to as "movingTo",
          moving_date as "movingDate", service_type as "serviceType", items, item_rows as "itemRows",
          message, whatsapp_url as "whatsappUrl", status, admin_notes as "adminNotes",
          email_delivered as "emailDelivered", submitted_at as "submittedAt"
        FROM enquiries
        ORDER BY submitted_at DESC
      `);
      res.json({ enquiries: result.rows });
    } catch (error) {
      console.error('Failed to list enquiries:', error);
      res.status(500).json({ error: 'Database error loading enquiries.' });
    }
  })();
});

app.patch('/api/enquiries/:id', (req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      const id = req.params.id;
      const { status, adminNotes } = req.body || {};

      await pool!.query(
        `UPDATE enquiries SET
          status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          updated_at = NOW()
        WHERE id = $3`,
        [status || null, adminNotes !== undefined ? adminNotes : null, id]
      );

      // Sync into portal_collections
      const existing = await pool!.query(
        `SELECT value FROM portal_collections WHERE collection_key = 'upl_quote_requests'`
      );
      if (existing.rows[0]?.value && Array.isArray(existing.rows[0].value)) {
        const updated = existing.rows[0].value.map((e: any) => {
          if (e.id === id) {
            return {
              ...e,
              ...(status ? { status } : {}),
              ...(adminNotes !== undefined ? { adminNotes } : {}),
            };
          }
          return e;
        });
        await pool!.query(
          `UPDATE portal_collections SET value = $1::jsonb, updated_at = NOW() WHERE collection_key = 'upl_quote_requests'`,
          [JSON.stringify(updated)]
        );
      }

      broadcastCollectionChange('upl_quote_requests');
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update enquiry:', error);
      res.status(500).json({ error: 'Database error updating enquiry.' });
    }
  })();
});

app.delete('/api/enquiries/:id', (req, res) => {
  void (async () => {
    try {
      await ensureDatabase();
      const id = req.params.id;
      await pool!.query('DELETE FROM enquiries WHERE id = $1', [id]);

      // Sync into portal_collections
      const existing = await pool!.query(
        `SELECT value FROM portal_collections WHERE collection_key = 'upl_quote_requests'`
      );
      if (existing.rows[0]?.value && Array.isArray(existing.rows[0].value)) {
        const updated = existing.rows[0].value.filter((e: any) => e.id !== id);
        await pool!.query(
          `UPDATE portal_collections SET value = $1::jsonb, updated_at = NOW() WHERE collection_key = 'upl_quote_requests'`,
          [JSON.stringify(updated)]
        );
      }

      broadcastCollectionChange('upl_quote_requests');
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      res.status(500).json({ error: 'Database error deleting enquiry.' });
    }
  })();
});

// ----------------------------------------------------
// Meta WhatsApp Cloud API Endpoint
// ----------------------------------------------------
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

// ----------------------------------------------------
// Serve Static Vite Dist in Production & Standalone
// ----------------------------------------------------
const distDirectory = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDirectory)) {
  app.use(express.static(distDirectory));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distDirectory, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('server.js') ||
  process.env.NODE_ENV === 'production'
);

if (isMainModule) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`UrbanPro portal server listening on http://localhost:${port}`);
  });
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} already active; continuing.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
