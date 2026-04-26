"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * Two-step email OTP login.
 *
 * Why OTP and not magic link: the desktop Electron build can't receive a
 * clicked magic link (Gmail/OS open it in the default browser, which has a
 * separate cookie jar). The user ends up logged in in Chrome but anonymous
 * inside the app. OTP keeps the whole flow inside the Electron window: we
 * send a 6-digit code via email, user types it here, Supabase creates the
 * session in-app.
 *
 * Prerequisite in Supabase Dashboard:
 *   Authentication → Email Templates → "Magic Link" — the template must
 *   reference `{{ .Token }}` (the 6-digit code) somewhere in the body.
 *   The default template includes it automatically; custom templates may
 *   need editing.
 */
export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (cooldown > 0) return;
    setSubmitting(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) {
        const match = /after (\d+) seconds/i.exec(error.message);
        if (match) {
          const seconds = Number(match[1]);
          setCooldown(seconds);
          toast.error(t("rateLimited", { seconds }));
          return;
        }
        if (/email rate limit exceeded/i.test(error.message)) {
          toast.error(t("emailQuotaExceeded"));
          return;
        }
        throw error;
      }
      setStep("otp");
      toast.success(t("codeSent"));
    } catch (err) {
      toast.error(t("error"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "email",
      });
      if (error) {
        // Supabase often returns "Token has expired or is invalid" as a
        // single message — check `invalid` first because wrong/truncated
        // codes are far more common than genuinely expired ones (default
        // OTP lifetime is 60 min).
        if (/invalid|token/i.test(error.message)) {
          toast.error(t("codeInvalid"));
        } else if (/expired/i.test(error.message)) {
          toast.error(t("codeExpired"));
        } else {
          throw error;
        }
        return;
      }
      const next = params.get("next") ?? "/";
      toast.success(t("welcome"));
      router.replace(next);
      router.refresh();
    } catch (err) {
      toast.error(t("error"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyCode} className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setStep("email");
            setOtp("");
          }}
          className="-ml-2"
        >
          <ArrowLeft className="mr-1 size-4" />
          {t("back")}
        </Button>
        <div className="space-y-2">
          <Label htmlFor="otp">{t("codeLabel")}</Label>
          {/*
            OTP length in Supabase Dashboard (Authentication → Providers →
            Email → OTP Length) can be 6-10 digits. We accept the full range
            so the form isn't tied to a specific project setting.
          */}
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6,10}"
            maxLength={10}
            required
            placeholder="12345678"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            disabled={isSubmitting}
            autoFocus
            className="text-center text-lg tracking-[0.4em]"
          />
          <p className="text-xs text-muted-foreground">
            {t("codeHint", { email })}
          </p>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || otp.length < 6}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <KeyRound className="mr-1" />
          )}
          {t("verify")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isSubmitting || cooldown > 0}
          onClick={() => sendCode()}
        >
          {cooldown > 0 ? t("retryIn", { seconds: cooldown }) : t("resendCode")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4">
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
        disabled={isSubmitting || cooldown > 0 || email.length < 3}
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Mail className="mr-1" />
        )}
        {cooldown > 0 ? t("retryIn", { seconds: cooldown }) : t("sendCode")}
      </Button>
    </form>
  );
}
