<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/af2df666-ccbb-44fd-be17-f67b4f970737

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Neon PostgreSQL database

This application now stores the portal data in PostgreSQL instead of
`data/portal-store.json` or browser local storage. Browser storage is retained
only as an offline cache and is automatically imported the first time the
database has no value for a collection.

1. In Neon, create a database and copy its **pooled** connection string.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to that connection
   string. Never use a `VITE_` prefix for this value and never expose it in the
   frontend.
3. Run `npm run dev:server` for the API and `npm run dev` for the frontend, or
   run `npm start` for the production server.
4. On first connection, the API creates the `portal_collections` table
   automatically. You may also run [database/schema.sql](database/schema.sql)
   in the Neon SQL editor.
5. Add the same `DATABASE_URL` to your hosting provider's server environment
   variables before deployment.

The PostgreSQL-backed collections are enquiries, surveys, quotations, packing
lists, bilties, bills, money receipts, vouchers, car and bike condition
reports, company profile, and signatures.

## Meta WhatsApp Cloud API

Email enquiries are sent from the browser through Web3Forms. Configure
`VITE_WEB3FORMS_ACCESS_KEY` in `.env`. Web3Forms requires its free-plan API
requests to originate in the browser; server-side API submission requires a Pro
plan.

Copy `.env.example` to `.env` and fill in the Meta values before running
`npm run dev:server` or `npm start`. The access token stays on the server.

Create and approve a WhatsApp message template named
`urbanpro_new_enquiry` with seven body variables:

1. Customer name
2. Customer phone
3. Email
4. Moving date
5. Service type
6. Requested items
7. Moving route

The enquiry form sends the email and then sends this approved template through
Meta's WhatsApp Cloud API. It does not open or redirect to WhatsApp. Email
submission is the primary delivery. WhatsApp notification configuration is
optional and a WhatsApp API failure does not invalidate a successfully submitted
email enquiry.
