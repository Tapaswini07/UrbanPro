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

## Meta WhatsApp Cloud API

Email enquiries are sent directly by the server through Gmail SMTP. Configure
`SMTP_USER`, `SMTP_PASS` (a Gmail App Password), and `SMTP_RECIPIENT_EMAIL` in `.env`.

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

The enquiry form sends the existing email and then sends this approved template
through Meta's WhatsApp Cloud API. It does not open or redirect to WhatsApp.
Email submission is the primary delivery. WhatsApp notification configuration is
optional and a WhatsApp API failure does not invalidate a successfully submitted
email enquiry.
