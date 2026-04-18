import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100dvh)] grid place-items-center app-gradient p-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-7xl font-bold tracking-tight">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The track you were looking for has drifted out of the playlist.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
