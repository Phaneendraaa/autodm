# AutoDM
Next.js + Postgres. Instagram comment keyword to automatic DM (Private Reply). 1 credit = 1 DM, credits added by admin.
Setup: put the values from `.env.example` into Vercel env vars, deploy, then open `/api/setup?key=SETUP_KEY` once.
Meta webhook: callback `APP_URL/api/webhook`, verify token = VERIFY_TOKEN, field: comments.
Instagram OAuth redirect URI: `APP_URL/api/ig/callback`.
