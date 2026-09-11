# Three-hour booking availability

The Worker file `cloudflare/royal-pet-admin-api-r2-final.js` now exposes `GET /public/availability?date=YYYY-MM-DD` and validates appointment times on `POST /appointments`.

Slots are generated every 3 hours from the configured opening time. Existing appointments block their slot and any slot within 3 hours. Cancelled/deleted appointments do not block time.

After changing the Worker, redeploy the Worker in Cloudflare. The website page is already wired to the new public availability endpoint.
