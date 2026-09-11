R2 VERIFIED UPLOAD

The portfolio upload flow now sends exact binary bytes and includes a SHA-256 integrity check. The Worker verifies the received bytes and, for images, reads the object back from R2 and compares size + SHA-256 before reporting success.

Deploy cloudflare/royal-pet-admin-api-r2-verified.js as the code of Worker royal-pet-admin-api. Keep the existing bindings and secrets, especially R2 binding MEDIA and D1 binding DB.

After deploy, /health returns version r2-verified-20260911.
