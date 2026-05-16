/**
 * MedTrustX — UI Store (Zustand)
 * Global UI state: sidebar, modals, theme, command palette.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIStore {
  /* ── Sidebar ─────────────────────────────────────────── */
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;

  /* ── Theme ───────────────────────────────────────────── */
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  /* ── Global Search / Command Palette ─────────────────── */
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

  /* ── Breadcrumbs ─────────────────────────────────────── */
  pageTitle: string;
  pageDescription: string;
  setPageMeta: (title: string, description?: string) => void;

  /* ── Modals ──────────────────────────────────────────── */
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        /* Sidebar */
        sidebarCollapsed: false,
        sidebarMobileOpen: false,
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }), false, 'ui/toggleSidebar'),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),
        setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }, false, 'ui/setSidebarMobileOpen'),

        /* Theme */
        theme: 'dark',
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        /* Command Palette */
        commandPaletteOpen: false,
        setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }, false, 'ui/setCommandPaletteOpen'),
        toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen }), false, 'ui/toggleCommandPalette'),

        /* Page Meta */
        pageTitle: 'Dashboard',
        pageDescription: '',
        setPageMeta: (title, description = '') => set({ pageTitle: title, pageDescription: description }, false, 'ui/setPageMeta'),

        /* Modals */
        activeModal: null,
        modalData: null,
        openModal: (id, data) => set({ activeModal: id, modalData: data ?? null }, false, 'ui/openModal'),
        closeModal: () => set({ activeModal: null, modalData: null }, false, 'ui/closeModal'),
      }),
      {
        name: 'mt-ui',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
