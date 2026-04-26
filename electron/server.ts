import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

let serverProcess: ChildProcess | null = null;

export function isPortAvailable(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen(port, host);
  });
}

// Try the preferred port first (so devs see 3000 in URLs when they can), but
// fall back to an OS-assigned free port when it's busy. Hardcoding 3000
// breaks the packaged app on machines that already have something on 3000
// (another dev server, leftover zombie from a previous launch, etc.) —
// user sees "Port 3000 is already in use" and the app won't start.
export async function getFreePort(
  preferred: number,
  host = "127.0.0.1",
): Promise<number> {
  if (await isPortAvailable(preferred, host)) return preferred;
  return new Promise<number>((resolve, reject) => {
    const tester = createServer();
    tester.once("error", reject);
    tester.once("listening", () => {
      const addr = tester.address();
      if (addr && typeof addr !== "string") {
        const picked = addr.port;
        tester.close(() => resolve(picked));
      } else {
        tester.close(() => reject(new Error("Could not determine free port")));
      }
    });
    tester.listen(0, host);
  });
}

function resolveStandalonePaths() {
  const base = app.isPackaged
    ? path.join(process.resourcesPath, "app")
    : path.join(__dirname, "..");

  const serverScript = path.join(base, ".next", "standalone", "server.js");
  const standaloneDir = path.join(base, ".next", "standalone");
  const envFile = path.join(base, ".env.production");
  return { serverScript, standaloneDir, envFile };
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const env: Record<string, string> = {};
  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (/^[A-Z_][A-Z0-9_]*$/i.test(key)) env[key] = value;
  }
  return env;
}

async function appendLog(line: string): Promise<void> {
  try {
    const logsDir = app.getPath("logs");
    await mkdir(logsDir, { recursive: true });
    await appendFile(
      path.join(logsDir, "server.log"),
      `[${new Date().toISOString()}] ${line}\n`,
    );
  } catch {
    /* ignore log failures */
  }
}

export async function startNextServer(port: number): Promise<void> {
  const { serverScript, standaloneDir, envFile } = resolveStandalonePaths();

  if (!existsSync(serverScript)) {
    throw new Error(
      `Next.js standalone server not found at ${serverScript}. Run "npm run build" first.`,
    );
  }

  const free = await isPortAvailable(port);
  if (!free) {
    throw new Error(
      `Port ${port} is already in use. Close the conflicting application and try again.`,
    );
  }

  const fileEnv = parseEnvFile(envFile);

  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [serverScript], {
      cwd: standaloneDir,
      env: {
        ...process.env,
        ...fileEnv,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    serverProcess = child;

    const onReady = (chunk: Buffer) => {
      const text = chunk.toString();
      void appendLog(`[stdout] ${text.trim()}`);
      if (/ready|listening|started server/i.test(text)) {
        child.stdout?.off("data", onReady);
        resolve();
      }
    };

    child.stdout?.on("data", onReady);
    child.stderr?.on("data", (chunk: Buffer) => {
      void appendLog(`[stderr] ${chunk.toString().trim()}`);
    });

    child.once("error", (err) => {
      void appendLog(`[error] ${err.message}`);
      reject(err);
    });

    child.once("exit", (code) => {
      void appendLog(`[exit] code=${code}`);
      serverProcess = null;
    });

    setTimeout(() => {
      if (child.exitCode === null && child.pid) resolve();
    }, 15000);
  });
}

export function stopNextServer(): void {
  if (!serverProcess) return;
  try {
    if (process.platform === "win32" && serverProcess.pid) {
      spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {
    /* ignore */
  }
  serverProcess = null;
}
