"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success(t("linkSent"));
    } catch (err) {
      toast.error(t("error"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <Mail className="mx-auto h-10 w-10 text-primary" />
        <p className="text-sm">{t("linkSent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || email.length < 3}
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Mail className="mr-1" />
        )}
        {t("sendLink")}
      </Button>
    </form>
  );
}
