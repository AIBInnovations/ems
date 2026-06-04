import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { db } from "@/data/db";
import { restore } from "@/lib/bin";
import { authService } from "@/data/services/authService";
import { useAuthStore } from "@/store/auth";
import { useServicesStore } from "@/store/services";
import type { CollectionName } from "@/types";

interface DeleteRequest {
  label: string;
  body?: string;
  entityType?: CollectionName;
  entityId?: string;
  onConfirm: () => Promise<void> | void;
  afterDelete?: () => void;
}

interface ConfirmRequest {
  title: string;
  body?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

interface DialogsApi {
  requestDelete: (req: DeleteRequest) => void;
  confirm: (req: ConfirmRequest) => void;
}

const DialogsContext = createContext<DialogsApi | null>(null);

export function useDialogs(): DialogsApi {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used within DialogsProvider");
  return ctx;
}

export function DialogsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id ?? "");
  const reloadServices = useServicesStore((s) => s.reload);

  const [del, setDel] = useState<DeleteRequest | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [step, setStep] = useState<"pin" | "confirm">("pin");
  const [busy, setBusy] = useState(false);

  const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  const requestDelete = useCallback((req: DeleteRequest) => {
    setDel(req);
    setPin("");
    setPinError(false);
    setStep("pin");
  }, []);

  const confirm = useCallback((req: ConfirmRequest) => setConfirmReq(req), []);

  const closeDelete = () => {
    setDel(null);
    setPin("");
    setPinError(false);
    setBusy(false);
  };

  const verifyPin = () => {
    if (authService.verifyPin(userId, pin)) {
      setPinError(false);
      setStep("confirm");
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const doDelete = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await del.onConfirm();
      del.afterDelete?.();
      reloadServices();
      const binItem =
        del.entityId != null
          ? db.query("recycleBin", (i) => i.entityId === del.entityId).slice(-1)[0]
          : undefined;
      toast.success(`${del.label} ${t("delete.movedToBin", "moved to Recycle Bin")}`, {
        description: t("delete.confirmBody", "Recoverable for 15 days."),
        action: binItem
          ? {
              label: t("action.restore", "Undo"),
              onClick: () => {
                restore(binItem.id);
                del.afterDelete?.();
                reloadServices();
                toast.success(t("action.restore", "Restored"));
              },
            }
          : undefined,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      closeDelete();
    }
  };

  const runConfirm = async () => {
    if (!confirmReq) return;
    setConfirmBusy(true);
    try {
      await confirmReq.onConfirm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setConfirmBusy(false);
      setConfirmReq(null);
    }
  };

  const api = useMemo(() => ({ requestDelete, confirm }), [requestDelete, confirm]);

  return (
    <DialogsContext.Provider value={api}>
      {children}

      {/* Delete: PIN → confirm */}
      <Dialog open={!!del} onOpenChange={(o) => !o && closeDelete()}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => { e.preventDefault(); pinRef.current?.focus(); }}>
          {step === "pin" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-destructive" />
                  {t("delete.pinTitle", "Confirm deletion")}
                </DialogTitle>
                <DialogDescription>{t("delete.pinPrompt", "Enter your security PIN to continue.")}</DialogDescription>
              </DialogHeader>
              <Input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
                onKeyDown={(e) => e.key === "Enter" && verifyPin()}
                placeholder="••••"
                className={cn("text-center text-lg tracking-[0.5em]", pinError && "animate-shake border-destructive")}
                aria-invalid={pinError}
              />
              {pinError ? <p className="text-sm text-destructive">{t("delete.pinWrong", "Incorrect PIN. Try again.")} (demo: 1234)</p> : <p className="text-xs text-muted-foreground">Demo PIN: 1234</p>}
              <DialogFooter>
                <Button variant="outline" onClick={closeDelete}>{t("action.cancel", "Cancel")}</Button>
                <Button onClick={verifyPin} disabled={pin.length < 4}>{t("common.next", "Continue")}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  {t("delete.confirmTitle", "Are you sure?")}
                </DialogTitle>
                <DialogDescription>
                  <span className="font-medium text-foreground">{del?.label}</span> — {del?.body ?? t("delete.confirmBody", "This item will move to the Recycle Bin and can be restored for 15 days.")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeDelete} disabled={busy}>{t("action.cancel", "Cancel")}</Button>
                <Button variant="destructive" onClick={doDelete} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  {t("action.delete", "Delete")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generic confirm */}
      <Dialog open={!!confirmReq} onOpenChange={(o) => !o && setConfirmReq(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmReq?.title}</DialogTitle>
            {confirmReq?.body ? <DialogDescription>{confirmReq.body}</DialogDescription> : null}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReq(null)} disabled={confirmBusy}>{t("action.cancel", "Cancel")}</Button>
            <Button variant={confirmReq?.destructive ? "destructive" : "default"} onClick={runConfirm} disabled={confirmBusy}>
              {confirmBusy ? <Loader2 className="size-4 animate-spin" /> : null}
              {confirmReq?.confirmLabel ?? t("action.confirm", "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogsContext.Provider>
  );
}
