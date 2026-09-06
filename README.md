# StaffMatch site (public)

Static marketing landing only. The app lives in the private `staffmatch` repo.

## Local
Open `index.html`, or: `python -m http.server 8080`

## Auth (Supabase)
Pilot signup (`pilot.html`) and Sign in (`signin.html`) use the **Supabase JS client** (CDN) for email/password:

- `signUp({ email, password, options.data })`
- `signInWithPassword({ email, password })`

Passwords go **only** to Supabase Auth. They are never emailed, never sent through FormSubmit, and never POSTed to the Render `/api/auth/*` routes. `STAFFMATCH_API` (`https://staffmatch-api.onrender.com`) is for future API calls only.

The public **anon** key in `config.js` is intentional for the browser client. **Never add a `service_role` key.**

The Supabase client stores the session in the browser (localStorage). After successful signup or sign-in:

- If `STAFFMATCH_APP_URL` in `config.js` is set (optional; leave `''` until a hosted app is live), the browser redirects there. The app must use the same Supabase project so it can read that session.
- If unset, the site shows honest success copy and does not promise a hosted app.

Cancel / Back to StaffMatch / Use a different account always leave the forms.

If config is missing or auth fails, the forms show a clear error and do not crash.

## GitHub Pages
No build step. Settings → Pages → Deploy from branch → `main` / root.
Expected URL: https://camkoe13.github.io/staffmatch-site/

Supabase Auth → URL configuration should allow:

- Site URL: `https://camkoe13.github.io/staffmatch-site/`
- Redirect URLs: `https://camkoe13.github.io` and `https://camkoe13.github.io/staffmatch-site/`
