import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DialogsProvider } from "@/components/shared/dialogs";
import { initUi } from "@/store/ui";
import { autoPurge } from "@/lib/bin";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initUi();
    autoPurge();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <DialogsProvider>
          {children}
          <Toaster />
        </DialogsProvider>
      </TooltipProvider>
    </I18nextProvider>
  );
}
