# StaffMatch site (public)

Static marketing landing only. The app lives in the private `staffmatch` repo.

## Local
Open `index.html`, or: `python -m http.server 8080`

## Auth API
Pilot signup (`pilot.html`) and Sign in (`signin.html`) POST JSON to the StaffMatch auth API:

- `POST {API}/api/auth/register` `{ email, password, firstName?, lastName?, phone? }` → `{ token, user }`
- `POST {API}/api/auth/login` `{ email, password }` → `{ token, user }`

The returned token is stored in `localStorage` (`staffmatch_token`). Passwords go **only** to this API via `fetch` — never FormSubmit, mailto, or query strings.

Base URL lives in `config.js` and defaults to the hosted Render API (no trailing slash):

```js
window.STAFFMATCH_API = window.STAFFMATCH_API || 'https://staffmatch-api.onrender.com';
```

GitHub Pages deploys this default, so visitors hit `https://staffmatch-api.onrender.com/api/auth/*`. Health check: `https://staffmatch-api.onrender.com/api/health`.

For a local API, set the global *before* `config.js` loads:

```js
window.STAFFMATCH_API = 'http://localhost:3001';
```

The API must allow CORS from `https://camkoe13.github.io`. If it is unreachable, the forms show: *Couldn't reach StaffMatch — try again later or email staffmatch.support@gmail.com*.

## GitHub Pages
Settings → Pages → Deploy from branch → `main` / root (or GitHub Actions if added).
Expected URL: https://camkoe13.github.io/staffmatch-site/

After merge to `main`, Pages serves the forms against `https://staffmatch-api.onrender.com`.
