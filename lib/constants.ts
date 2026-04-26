export const APP_NAME = "UniTune";

export const DEFAULT_LOCALE = "en" as const;
export const SUPPORTED_LOCALES = ["en", "ru"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_VOLUME = 0.7;

export const CROSSFADE_MS = 200;

export const PROGRESS_UPDATE_MS = 250;

export const SEARCH_DEBOUNCE_MS = 250;

export const BOTTOM_PLAYER_HEIGHT_PX = 88;
export const SIDEBAR_WIDTH_PX = 260;
export const SIDEBAR_COLLAPSED_WIDTH_PX = 72;
