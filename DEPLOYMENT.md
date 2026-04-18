# Deploying UniTune

Target stack: **Vercel** for the Next.js app, **Supabase** for auth/database.
The steps below assume a fresh Vercel + Supabase account.

---

## 1. Supabase

1. <https://supabase.com/dashboard> → **New project**.
   - Set a strong DB password (store it in a password manager).
   - Pick a region close to your users.
2. **SQL Editor** → paste `lib/supabase/schema.sql` → *Run*. This creates all
   tables, RLS policies, the `on_auth_user_created` trigger, and the
   `playlist-covers` storage bucket with its RLS.
3. **Authentication → URL Configuration**:
   - *Site URL*: `https://<your-domain>`
   - *Redirect URLs*: add `https://<your-domain>/auth/callback` and
     `http://localhost:3000/auth/callback`.
4. **Authentication → Providers**:
   - Enable *Email* (magic link).
   - Optional: Google/GitHub — add redirect URI
     `https://<project>.supabase.co/auth/v1/callback` to the OAuth app on the
     corresponding provider.
5. **Settings → API**: copy the keys to your Vercel project env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Spotify Developer App

1. <https://developer.spotify.com/dashboard> → **Create app**.
2. Redirect URIs (add both):
   - `https://<your-domain>/api/auth/spotify/callback`
   - `http://localhost:3000/api/auth/spotify/callback`
3. APIs used: tick **Web API** and **Web Playback SDK**.
4. Copy Client ID / Secret into Vercel env vars:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI=https://<your-domain>/api/auth/spotify/callback`
5. Spotify dev apps are in “Development mode” by default — only you and the
   users you explicitly add under *Users and Access* can sign in. To release
   publicly you must submit a quota-extension request.

---

## 3. Encryption key

Generate once and set `ENCRYPTION_KEY` in Vercel project env vars:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never rotate this after users have connected providers — rotating invalidates
all encrypted OAuth tokens in `provider_connections`. If you must rotate, do it
together with a migration that deletes the affected rows (users will just
reconnect).

---

## 4. Vercel

1. Import the Git repository into Vercel.
2. **Environment Variables** (set for Production, Preview, Development):

   | Name                           | Value                                             |
   |--------------------------------|---------------------------------------------------|
   | `NEXT_PUBLIC_APP_URL`          | `https://<your-domain>`                           |
   | `NEXT_PUBLIC_SITE_URL`         | `https://<your-domain>` (optional, for sitemap)   |
   | `NEXT_PUBLIC_SUPABASE_URL`     | from Supabase                                     |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`| from Supabase                                     |
   | `SUPABASE_SERVICE_ROLE_KEY`    | from Supabase                                     |
   | `ENCRYPTION_KEY`               | base64 32-byte random                             |
   | `SPOTIFY_CLIENT_ID`            | from Spotify dashboard                            |
   | `SPOTIFY_CLIENT_SECRET`        | from Spotify dashboard                            |
   | `SPOTIFY_REDIRECT_URI`         | `https://<your-domain>/api/auth/spotify/callback` |
   | `SOUNDCLOUD_CLIENT_ID`         | leave empty unless you have a legacy key          |

3. **Build & Development Settings**: leave defaults — `next build` already runs
   Serwist to emit `public/sw.js`.
4. Deploy.

---

## 5. Post-deploy verification

Run through this checklist on the live URL:

- [ ] `/login` — magic link email arrives, sign-in works.
- [ ] `/settings/connections` — click **Connect Spotify** → consent screen →
      back on site as “Connected as …”. Row appears in `provider_connections`
      with encrypted tokens.
- [ ] `/search?q=queen` — Spotify results render; artist/album/playlist links
      open the corresponding detail pages.
- [ ] Click Play on a track → Spotify Web Playback SDK starts (Premium),
      OS media controls show track metadata.
- [ ] Paste a SoundCloud URL in the Search page → track added, plays through
      the Widget API, cross-fades on next.
- [ ] Like a track → appears in `/library/liked`.
- [ ] Create a super-playlist → add Spotify + SoundCloud tracks → reload → state
      preserved, Play works.
- [ ] `/settings/account` — switch language and theme; persists.
- [ ] Lighthouse: Performance ≥ 85, Accessibility ≥ 95, PWA installable.

---

## 6. Domain / DNS

Point your apex or subdomain at Vercel (`A` record to `76.76.21.21` or `CNAME`
to `cname.vercel-dns.com`). Vercel provisions TLS automatically. Update
`NEXT_PUBLIC_APP_URL` and all redirect URIs after the domain is live.

---

## 7. Troubleshooting

- **“INVALID_CLIENT: Invalid redirect URI”** — the `SPOTIFY_REDIRECT_URI` does
  not exactly match the one registered in the Spotify dashboard (protocol,
  trailing slash, and case must match).
- **Tokens appear as gibberish / 401s** — `ENCRYPTION_KEY` changed. Clear the
  `provider_connections` table and have users reconnect.
- **“Spotify Premium required”** — expected on Free accounts; fallback 30-sec
  preview should still play.
- **Supabase `row-level security` errors** — run `lib/supabase/schema.sql`
  again; the policies may have been dropped in a migration.
- **PWA not installable** — check `public/icons/icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png` exist and are reachable.
