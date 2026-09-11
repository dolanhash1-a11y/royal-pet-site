# Royal Pet R2 Worker deploy

The R2-ready Worker is in `cloudflare/royal-pet-admin-api-r2.js`.

Cloudflare Worker must have an R2 binding named `MEDIA` pointing to the Royal Pet media bucket.
After adding the binding, publish/deploy the Worker with the R2-ready script. The cabinet checks `GET /health` and expects `r2Configured: true`.

The cabinet portfolio uploader sends `POST /media/upload` as `multipart/form-data` with fields `file` and `type`.
