<div align="center">

# 🎵 UniTune

### Production-ready музыкальный агрегатор

**⚠️ ПРОЕКТ В АКТИВНОЙ РАЗРАБОТКЕ — не рекомендуется для продакшн-использования**

[![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)](https://github.com/Walpewhat/UniTune)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-auth%20%2B%20db-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

Единый плеер и библиотека для **Spotify** и **SoundCloud** в одном интерфейсе.

</div>

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Стек технологий](#-стек-технологий)
- [Требования](#-требования)
- [Быстрый старт](#-быстрый-старт)
- [Настройка провайдеров](#-настройка-провайдеров)
- [Переменные окружения](#-переменные-окружения)
- [Архитектура](#-архитектура)
- [Известные ограничения](#-известные-ограничения)
- [Roadmap](#-roadmap)

---

## ✨ Возможности

| Функция | Статус |
|---|---|
| 🔐 Авторизация через Supabase (magic link) | ✅ Готово |
| 🎧 Spotify — полное воспроизведение (Premium) | ✅ Готово |
| 🎧 Spotify — 30-сек превью (Free) | ✅ Готово |
| ☁️ SoundCloud — воспроизведение по URL | ✅ Готово |
| 🔍 Унифицированный поиск по провайдерам | ✅ Готово |
| 📚 Библиотека (лайки, плейлисты, альбомы) | ✅ Готово |
| 🎼 Супер-плейлисты (треки из разных сервисов) | ✅ Готово |
| 🔀 Shuffle, Repeat, очередь | ✅ Готово |
| 📱 PWA — установка как приложение | ✅ Готово |
| 🌍 Мультиязычность (ru / en) | ✅ Готово |
| ⌨️ Глобальный поиск ⌘K | ✅ Готово |
| 🍎 Apple Music | 🔜 Планируется |
| 🎵 Яндекс Музыка | 🔜 Планируется |

---

## 🛠 Стек технологий

**Frontend**
- [Next.js 15](https://nextjs.org/) — App Router, RSC, typedRoutes
- [React 19](https://react.dev/) + TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) — стейт-менеджмент
- [TanStack Query](https://tanstack.com/query) — серверный стейт
- [next-intl](https://next-intl-docs.vercel.app/) — i18n (ru/en)

**Backend / Инфраструктура**
- [Supabase](https://supabase.com/) — PostgreSQL, Auth, RLS
- [Serwist](https://serwist.pages.dev/) — PWA / Service Worker
- AES-256-GCM — шифрование OAuth-токенов

**Музыкальные провайдеры**
- Spotify Web API + Web Playback SDK
- SoundCloud oEmbed + Widget API

---

## 📦 Требования

Перед установкой убедитесь, что у вас есть:

- **Node.js** >= 20.x ([скачать](https://nodejs.org/))
- **npm** >= 10.x (идёт в комплекте с Node.js)
- Аккаунт **Supabase** (бесплатный) — [supabase.com](https://supabase.com)
- Аккаунт разработчика **Spotify** — [developer.spotify.com](https://developer.spotify.com/dashboard)

---

## 🚀 Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/Walpewhat/UniTune.git
cd UniTune
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Настройте переменные окружения

```bash
cp .env.example .env.local
```

Откройте `.env.local` и заполните все значения (см. [раздел ниже](#-переменные-окружения)).

### 4. Настройте базу данных Supabase

1. Войдите в [app.supabase.com](https://app.supabase.com) и создайте новый проект
2. Перейдите в **SQL Editor**
3. Вставьте и выполните содержимое файла `lib/supabase/schema.sql`

### 5. Запустите приложение

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## 🔑 Настройка провайдеров

### Spotify

1. Перейдите на [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Нажмите **Create app**
3. Заполните:
   - **App name**: UniTune (или любое)
   - **Redirect URI**: `http://localhost:3000/api/auth/spotify/callback`
   - **APIs used**: поставьте галочку на **Web API** и **Web Playback SDK**
4. Скопируйте **Client ID** и **Client Secret** в `.env.local`

> 💡 Для деплоя добавьте также продакшн-URL в Redirect URIs, например:  
> `https://your-app.vercel.app/api/auth/spotify/callback`

### SoundCloud

SoundCloud не требует ключей — используется публичный oEmbed API.  
Просто вставляйте ссылки на треки прямо в поиск (например, `https://soundcloud.com/artist/track`).

---

## 🔧 Переменные окружения

Создайте `.env.local` на основе `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-ключ

# Spotify
SPOTIFY_CLIENT_ID=ваш-client-id
SPOTIFY_CLIENT_SECRET=ваш-client-secret

# Шифрование OAuth-токенов (32 байта в hex)
# Генерация: openssl rand -hex 32
ENCRYPTION_KEY=ваш-ключ-шифрования

# URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Для генерации `ENCRYPTION_KEY`:
```bash
openssl rand -hex 32
```

---

## 🏗 Архитектура

```
UniTune/
├── app/                    # Next.js App Router
│   ├── (app)/             # Авторизованная зона (auth-гейт)
│   │   ├── home/          # Главная страница
│   │   ├── search/        # Поиск
│   │   ├── library/       # Библиотека
│   │   ├── album/         # Страница альбома
│   │   ├── artist/        # Страница артиста
│   │   └── playlist/      # Супер-плейлист
│   ├── api/               # API Routes
│   │   ├── auth/spotify/  # PKCE OAuth flow
│   │   ├── search/        # Унифицированный поиск
│   │   ├── home/          # Агрегация для главной
│   │   └── providers/     # Refresh токенов
│   └── login/             # Страница входа
├── lib/
│   ├── providers/         # Абстракция музыкальных провайдеров
│   ├── supabase/          # Клиент, схема БД, хелперы
│   ├── crypto/            # AES-256-GCM шифрование токенов
│   └── stores/            # Zustand: player, queue, ui
├── components/
│   ├── player/            # BottomPlayer, QueuePanel
│   ├── layout/            # Sidebar, TopBar, AppShell
│   └── ui/                # shadcn/ui компоненты
└── messages/              # Локализация (ru.json, en.json)
```

**Паттерн провайдеров** — для добавления нового музыкального сервиса достаточно реализовать интерфейс `MusicProvider`:

```typescript
interface MusicProvider {
  auth: ProviderAuth
  api: ProviderAPI
  createPlayer: () => ProviderPlayer
}
```

UI остаётся неизменным.

---

## ⚠️ Известные ограничения

Это не баги, а осознанные архитектурные решения, подробно описанные в документации:

| Ограничение | Причина |
|---|---|
| Spotify Premium обязателен для полного воспроизведения | Web Playback SDK — только для Premium |
| Free-аккаунт Spotify → только 30-сек превью | Ограничение API Spotify |
| Поиск по SoundCloud отключён | Dev Program закрыт с 2021 года |
| SoundCloud — только вставка по URL | Единственный публичный способ |
| Cross-fade = volume ramp, не gapless | SDK не поддерживает gapless mixing |
| Яндекс Музыка / YouTube Music не поддерживаются | Нет официальных API |

---

## 📈 Roadmap

- [ ] Apple Music интеграция
- [ ] Яндекс Музыка (если появится официальный API)
- [ ] Collaborative супер-плейлисты
- [ ] Last.fm scrobbling
- [ ] Экспорт плейлистов между провайдерами
- [ ] Mobile-приложение (React Native)

---

## 🤝 Участие в разработке

Проект открыт для контрибьюций! Если хотите помочь:

1. Fork репозитория
2. Создайте ветку: `git checkout -b feature/название-фичи`
3. Сделайте коммит: `git commit -m 'Add: описание изменения'`
4. Push: `git push origin feature/название-фичи`
5. Откройте Pull Request

---

## 📄 Лицензия

MIT © [Walpewhat](https://github.com/Walpewhat)

---

<div align="center">

**⚠️ Проект находится в активной разработке. API и структура могут меняться.**

Если нашли баг или есть идея — [открывайте Issue](https://github.com/Walpewhat/UniTune/issues)!

</div>
