"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Card>
        <CardContent className="space-y-3 p-8 text-center">
          <h1 className="text-xl font-semibold">We hit a snag</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error happened."}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">
              {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
