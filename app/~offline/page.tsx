import { APP_NAME } from "@/lib/constants";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">{APP_NAME} is offline</h1>
        <p className="text-muted-foreground">
          Reconnect to the internet to keep streaming. Your queue and library
          will pick up right where you left off.
        </p>
      </div>
    </main>
  );
}
