# StaffMatch site (public)

Static marketing landing only. The app lives in the private `staffmatch` repo.

## Local
Open `index.html`, or: `python -m http.server 8080`

## Auth API
Pilot signup (`pilot.html`) and Sign in (`signin.html`) POST JSON to the StaffMatch auth API:

- `POST {API}/api/auth/register` `{ email, password, firstName?, lastName?, phone? }` → `{ token, user }`
- `POST {API}/api/auth/login` `{ email, password }` → `{ token, user }`

The returned token is stored in `localStorage` (`staffmatch_token`). Passwords go **only** to this API via `fetch` — never FormSubmit, mailto, or query strings.

Base URL lives in `config.js`:

```js
window.STAFFMATCH_API = window.STAFFMATCH_API || 'http://localhost:3001';
```

For local API work, run the StaffMatch API on port 3001 and keep the default.

To point the public site at a hosted API later, edit `config.js` (or set `window.STAFFMATCH_API` *before* `config.js` loads):

```js
window.STAFFMATCH_API = window.STAFFMATCH_API || 'https://your-api.example.com';
```

GitHub Pages is HTTPS, so a hosted API must be HTTPS and must allow CORS from `https://camkoe13.github.io`. Until that is set, visitors will see a friendly error: *Couldn't reach StaffMatch — try again later or email staffmatch.support@gmail.com*. Localhost will not work for those visitors.

## GitHub Pages
Settings → Pages → Deploy from branch → `main` / root (or GitHub Actions if added).
Expected URL: https://camkoe13.github.io/staffmatch-site/
