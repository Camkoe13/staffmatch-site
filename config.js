/* StaffMatch marketing site → auth API.
   Default is local API for development. GitHub Pages visitors cannot
   reach localhost; they will see a friendly unreachable error until you
   point this at a hosted API, e.g.:

     window.STAFFMATCH_API = 'https://your-api.example.com';

   You can also set the global *before* this file loads. */
window.STAFFMATCH_API = window.STAFFMATCH_API || 'http://localhost:3001';
