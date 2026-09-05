# StaffMatch site (public)

Static marketing landing only. The app lives in the private `staffmatch` repo.

## Local
Open `index.html`, or: `python -m http.server 8080`

## Auth (Supabase)
Pilot signup (`pilot.html`) and Sign in (`signin.html`) use the **Supabase JS client** (CDN) for email/password:

- `signUp({ email, password, options.data })`
- `signInWithPassword({ email, password })`

Passwords go **only** to Supabase Auth. They are never emailed, never sent through FormSubmit, and never POSTed to the Render `/api/auth/*` HMAC routes.

Paste keys in `config.js` (Project Settings → API). **Anon public key only — never the service_role key.**

```js
window.SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'; // no trailing slash
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Until those placeholders are replaced, the forms show a clear “accounts aren’t connected yet” message.

The Supabase client stores the session. Success copy is: *You’re in — we’ll email when your pilot workspace is ready.* Cancel / Back to StaffMatch / Use a different account always leave the forms.

Optional future API base (not used for public signup):

```js
window.STAFFMATCH_API = window.STAFFMATCH_API || 'https://staffmatch-api.onrender.com';
```

## GitHub Pages
No build step. Settings → Pages → Deploy from branch → `main` / root.
Expected URL: https://camkoe13.github.io/staffmatch-site/

Supabase loads from `cdn.jsdelivr.net` (`@supabase/supabase-js@2`). Add `https://camkoe13.github.io` (and `/staffmatch-site` as needed) to the Supabase Auth redirect / site URL allow list when the project exists.
