import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Density, Language, Theme } from "@/types";
import i18n from "@/i18n";

interface UiState {
  theme: Theme;
  language: Language;
  density: Density;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
  setDensity: (d: Density) => void;
  toggleSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function applyLanguage(lang: Language) {
  document.documentElement.lang = lang;
  if (i18n.language !== lang) void i18n.changeLanguage(lang);
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "light",
      language: "en",
      density: "comfortable",
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      commandOpen: false,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
      setLanguage: (language) => {
        applyLanguage(language);
        set({ language });
      },
      toggleLanguage: () => {
        const next: Language = get().language === "en" ? "hi" : "en";
        applyLanguage(next);
        set({ language: next });
      },
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setMobileSidebar: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
    }),
    {
      name: "ems-ui",
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        density: s.density,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
);

/** Apply persisted theme + language to the DOM on boot. */
export function initUi() {
  const { theme, language } = useUiStore.getState();
  applyTheme(theme);
  applyLanguage(language);
}
