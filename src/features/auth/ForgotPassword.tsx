import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { authService } from "@/data/services/authService";

export function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"identify" | "reset">("identify");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setBusy(true);
    const res = await authService.forgotPassword(identifier);
    setBusy(false);
    if (res.ok) {
      toast.success("Reset code sent (demo): " + res.code);
      setCode(res.code ?? "");
      setStep("reset");
    }
  };

  const reset = async () => {
    setBusy(true);
    const res = await authService.resetPassword(identifier, code, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Password reset. You can sign in now.");
      navigate("/login");
    } else {
      toast.error(res.error ?? "Reset failed");
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 shadow-md">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {t("common.back", "Back to sign in")}
        </Link>
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {step === "identify" ? <KeyRound className="size-6" /> : <MailCheck className="size-6" />}
        </div>

        {step === "identify" ? (
          <>
            <div className="space-y-1">
              <h1 className="font-display text-h2">{t("auth.forgot", "Forgot password?")}</h1>
              <p className="text-sm text-muted-foreground">Enter your username or email and we'll send a reset code.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="id">{t("auth.username", "Username or Email")}</Label>
              <Input id="id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="admin" />
            </div>
            <Button className="w-full" onClick={sendCode} disabled={busy || !identifier}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null} Send reset code
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="font-display text-h2">Reset your password</h1>
              <p className="text-sm text-muted-foreground">Enter the code we sent and choose a new password.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Reset code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="font-mono tracking-widest" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np">New password</Label>
              <Input id="np" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" onClick={reset} disabled={busy || password.length < 4}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null} Reset password
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
