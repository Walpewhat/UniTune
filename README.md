# UniTune

**All your music, one app.** UniTune is a cross-platform music aggregator built
with Next.js 15 that unifies Spotify and SoundCloud into a single, elegant
player. Search once, play anywhere, and build super-playlists that mix tracks
from multiple services.

> **Status:** MVP. Spotify (full) + SoundCloud (public URLs via Widget API).
> Yandex Music, YouTube Music and Apple Music are on the roadmap.

---

## Features

- 🎧 Unified player across providers with short cross-fade on transitions
- 🔎 Single search that queries every connected provider in parallel
- ❤️ Liked songs and super-playlists stored in Supabase (RLS-protected)
- 🖼️ Modern Spotify-style UI built on Tailwind v4 + shadcn/ui + Radix
- ⌨️ ⌘K command palette, full keyboard navigation
- 📱 Installable PWA with MediaSession controls
- 🌐 i18n: English + Russian out of the box
- 🔐 OAuth tokens encrypted at rest with AES-256-GCM

---

## Known limitations

1. **Spotify Premium is required for full playback.** Free accounts get 30-second
   previews via the `preview_url` fallback.
2. **SoundCloud search is not available.** SoundCloud closed its developer
   program to new registrations in 2021 — you can paste any public SoundCloud
   URL on the Search page to play it via their public Widget API.
3. **Cross-fade is volume-only** between providers. There is no gapless audio
   mixing because Spotify and SoundCloud don’t expose raw PCM.
4. **Yandex Music and YouTube Music** are not included in the MVP — neither has
   a public official API. We will not ship unofficial-API integrations.

---

## Quick start

```bash
# 1. Install deps (Node 20+)
npm install

# 2. Copy env vars and fill them in (see sections below)
cp .env.example .env.local

# 3. Apply Supabase schema (one-time, see DEPLOYMENT.md for details)
#    psql "$SUPABASE_DB_URL" -f lib/supabase/schema.sql

# 4. Run the dev server
npm run dev
# → http://localhost:3000
```

---

## Registering the required services

### 1. Supabase (auth + database)

1. Create a free project at <https://supabase.com/dashboard>.
2. **Settings → API**: copy `Project URL`, `anon public`, and `service_role` →
   put them into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. **Authentication → Providers**: enable **Email** (magic-link). Optionally
   enable Google / GitHub. Disable “Confirm email” for a smoother dev flow.
4. **SQL Editor**: paste the contents of `lib/supabase/schema.sql` and run it.
   This creates `profiles`, `provider_connections`, `super_playlists`,
   `super_playlist_tracks`, `liked_tracks`, `play_history`, and their RLS
   policies.
5. **Storage**: a `playlist-covers` bucket is created by the SQL above.

### 2. Spotify (Web API + Web Playback SDK)

1. Go to <https://developer.spotify.com/dashboard> and sign in.
2. Click **Create app**:
   - *App name*: `UniTune (local)`
   - *App description*: anything
   - *Redirect URI*: `http://localhost:3000/api/auth/spotify/callback`
   - *APIs used*: tick **Web API** and **Web Playback SDK**
   - Accept the developer terms
3. Copy the **Client ID** and **Client Secret** from the app dashboard into
   `.env.local`.
4. (Production) Add your production redirect URI
   (`https://your-domain/api/auth/spotify/callback`) in the Spotify dashboard.

### 3. SoundCloud (optional — search)

SoundCloud closed new developer registrations in 2021, so UniTune works out of
the box using their **public oEmbed + Widget API** (no key required): paste any
public SoundCloud URL on the Search page.

If you have a legacy `SOUNDCLOUD_CLIENT_ID`, set it in `.env.local` to unlock
aggregated SoundCloud search.

### 4. Encryption key

Generate a 32-byte base64 key for AES-256-GCM token encryption:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Put the output into `ENCRYPTION_KEY`. **Never rotate this value after users
have connected providers**, or their stored tokens will become unreadable.

---

## Architecture

```
app/                       # Next.js 15 App Router
  (app)/                   # authed layout with sidebar + bottom player
  (auth)/                  # public login pages
  api/                     # server routes (OAuth, search, library)
components/                # UI + player + layout + providers
lib/
  providers/               # MusicProvider abstraction (Spotify, SoundCloud)
  player/                  # PlayerController singleton + crossfade
  supabase/                # SSR client, middleware, schema + RLS
  crypto/                  # AES-256-GCM token cipher
  i18n/                    # next-intl config
stores/                    # Zustand stores (player, queue, UI)
messages/                  # en.json + ru.json
types/                     # UnifiedTrack, UnifiedAlbum, …
```

The core abstraction is the `MusicProvider` interface in
`lib/providers/types.ts`. Every provider exposes the same `auth`, `api`, and
`createPlayer` surface, so adding Apple Music, Yandex Music, etc. does not
require touching the UI.

---

## Scripts

| Script                | What it does                                  |
|-----------------------|-----------------------------------------------|
| `npm run dev`         | Next dev server on :3000                      |
| `npm run build`       | Production build (with Serwist PWA)           |
| `npm start`           | Run the production server                     |
| `npm run lint`        | ESLint                                        |
| `npm run typecheck`   | TypeScript (strict) type-check                |
| `npm run db:types`    | Regenerate `types/supabase.ts` from remote DB |

---

## Tech stack

Next.js 15 (App Router, Server Actions, RSC) · React 19 · TypeScript (strict) ·
Tailwind v4 · shadcn/ui · Radix UI · lucide-react · Zustand · TanStack Query v5 ·
Supabase (auth, Postgres, storage) · next-intl · @serwist/next · Zod.

---

## Post-MVP roadmap

- Apple Music via MusicKit JS (official SDK)
- Lyrics via Musixmatch (paid API)
- Cross-platform playlist import with ISRC matching
- Electron/Tauri desktop build (PWA covers most of the need today)
- Super-playlist public sharing
- Mobile app on React Native re-using `lib/providers/*`

---

## License

Source-available for personal use. See `LICENSE` (to be added).
