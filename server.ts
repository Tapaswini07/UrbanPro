import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

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
