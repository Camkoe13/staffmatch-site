/* StaffMatch marketing site config.
   Signup / sign-in use Supabase Auth (anon key only — never a service_role key).

   Cameron: paste the free-project values from
   Supabase → Project Settings → API, then save.

     window.SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';  // no trailing slash
     window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
*/
window.SUPABASE_URL = window.SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/* Future StaffMatch API (roster / matching). Not used for public signup. No trailing slash. */
window.STAFFMATCH_API = window.STAFFMATCH_API || 'https://staffmatch-api.onrender.com';
