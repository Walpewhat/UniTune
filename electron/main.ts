import { app, BrowserWindow, components, dialog, shell } from "electron";
import { accessSync } from "node:fs";
import path from "node:path";
import { getFreePort, startNextServer, stopNextServer } from "./server";

// Chromium command-line switch must be applied BEFORE app.whenReady().
//
// webPreferences.autoplayPolicy only applies to the main document.
// Spotify's Web Playback SDK runs inside a cross-origin iframe
// (sdk.scdn.co), which does NOT inherit the parent's policy. Symptom: audio
// plays for ~1 second then goes silent because each user gesture only grants
// a short activation window. Applying the switch process-wide fixes every
// nested frame.
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

const APP_PORT_PREFERRED = 3000;
// Enables DevTools + auto-opens them in the packaged build. Set via env:
//   set UNITUNE_DEBUG=1 && "%LOCALAPPDATA%\Programs\UniTune\UniTune.exe"
const DEBUG = process.env.UNITUNE_DEBUG === "1";
let appUrl = `http://127.0.0.1:${APP_PORT_PREFERRED}`;

const INTERNAL_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "accounts.spotify.com",
  "open.spotify.com",
  "sdk.scdn.co",
]);

let mainWindow: BrowserWindow | null = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function resolveIconPath(): string | undefined {
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, "assets", "icon.ico")]
    : [
        path.join(__dirname, "..", "assets", "icon.ico"),
        path.join(process.cwd(), "assets", "icon.ico"),
      ];
  return candidates.find((p) => {
    try {
      accessSync(p);
      return true;
    } catch {
      return false;
    }
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0a0a0a",
    show: false,
    icon: resolveIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged || DEBUG,
      // Spotify Web Playback SDK + <audio autoplay> нуждаются в
      // разрешении автозапуска: Chromium в Electron по умолчанию
      // требует явный user gesture, из-за чего звук молчит пока
      // пользователь сам не кликнет play руками.
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (DEBUG) mainWindow?.webContents.openDevTools({ mode: "detach" });
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const host = new URL(url).hostname;
      if (INTERNAL_HOSTS.has(host)) return { action: "allow" };
    } catch {
      /* malformed url — fall through */
    }
    void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    try {
      const host = new URL(url).hostname;
      if (!INTERNAL_HOSTS.has(host)) {
        event.preventDefault();
        void shell.openExternal(url);
      }
    } catch {
      /* ignore */
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  void mainWindow.loadURL(appUrl);
}

async function bootstrap(): Promise<void> {
  try {
    // Wait for bundled components (Widevine CDM) to be ready before opening
    // any window. Without this, Spotify's Web Playback SDK throws
    //   EMEError: No supported keysystem was found
    // because Chromium's MediaKeySystemAccess has no CDM registered yet.
    // First launch downloads the CDM (~20 MB); later launches resolve fast.
    await components.whenReady();
    console.log("[UniTune] components ready:", components.status());

    if (app.isPackaged) {
      const port = await getFreePort(APP_PORT_PREFERRED);
      appUrl = `http://127.0.0.1:${port}`;
      console.log("[UniTune] starting Next.js server on port", port);
      await startNextServer(port);
    }
    createWindow();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dialog.showErrorBox("UniTune — startup failed", message);
    app.exit(1);
  }
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  stopNextServer();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
