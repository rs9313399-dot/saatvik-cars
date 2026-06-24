import { create } from 'zustand';

export interface CarFilters {
  brand?: string;
  fuelType?: string;       // comma-separated multi-select (e.g. "Petrol,Diesel")
  transmission?: string;   // comma-separated multi-select
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  category?: string;
  ownerType?: string;      // comma-separated multi-select (e.g. "1st Owner,2nd Owner")
  location?: string;       // single
  maxKm?: number;
  minYear?: number;
  maxYear?: number;
  tags?: string;           // single tag (featured | urgent | best_deal)
}

interface StoreState {
  hydrated: boolean;
  hydrate: () => void;
  // Dark mode — site is permanently dark; this only manages the html class
  darkMode: boolean;
  // Active section for navbar highlighting
  activeSection: string;
  setActiveSection: (section: string) => void;
  // Mobile menu drawer
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  // Auth
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  // Active filters applied to FeaturedCars
  activeFilters: CarFilters;
  setActiveFilters: (filters: CarFilters) => void;
  clearFilters: () => void;
  // Sell Car Modal (admin — List Your Car)
  sellModalOpen: boolean;
  setSellModalOpen: (val: boolean) => void;
  // Sell/Trade Valuation Modal (customer — C1)
  sellValuationOpen: boolean;
  setSellValuationOpen: (val: boolean) => void;
  // Admin Login Modal
  loginModalOpen: boolean;
  setLoginModalOpen: (val: boolean) => void;
  // Admin Panel
  adminPanelOpen: boolean;
  setAdminPanelOpen: (val: boolean) => void;
  // Wishlist (persisted to localStorage)
  wishlistIds: string[];
  toggleWishlist: (carId: string) => void;
  removeFromWishlist: (carId: string) => void;
  clearWishlist: () => void;
  isWishlisted: (carId: string) => boolean;
  // Wishlist drawer
  wishlistOpen: boolean;
  setWishlistOpen: (val: boolean) => void;
  // Car list refresh trigger (increment to force FeaturedCars/AdminPanel to reload)
  carListVersion: number;
  bumpCarListVersion: () => void;
  // Compare feature (persisted to localStorage)
  compareList: string[];
  toggleCompare: (carId: string) => void;
  clearCompare: () => void;
  // D8: Recently viewed cars (persisted, max 8, newest first)
  lastViewedCars: string[];
  addViewedCar: (carId: string) => void;
  clearViewedCars: () => void;
}

const STORAGE_PREFIX = 'saatvik_';

function applyDarkMode(dark: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch {}
}

function loadCompareList(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}compareList`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

function saveCompareList(list: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}compareList`, JSON.stringify(list));
  } catch {}
}

// D8: lastViewedCars persistence
function loadViewedCars(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}lastViewedCars`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

function saveViewedCars(list: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}lastViewedCars`, JSON.stringify(list));
  } catch {}
}

export const useStore = create<StoreState>((set, get) => ({
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    let authToken: string | null = null;
    let isAdmin = false;
    let compareList: string[] = [];
    let wishlistIds: string[] = [];
    let lastViewedCars: string[] = [];
    try {
      const storedToken = localStorage.getItem(`${STORAGE_PREFIX}authToken`);
      if (storedToken) authToken = storedToken;
      const storedAdmin = localStorage.getItem(`${STORAGE_PREFIX}isAdmin`);
      if (storedAdmin === 'true') isAdmin = true;
      compareList = loadCompareList();
      lastViewedCars = loadViewedCars();
      const storedWishlist = localStorage.getItem(`${STORAGE_PREFIX}wishlist`);
      if (storedWishlist) {
        const parsed = JSON.parse(storedWishlist);
        if (Array.isArray(parsed)) wishlistIds = parsed;
      }
    } catch {}
    applyDarkMode(true); // site is permanently dark
    set({ hydrated: true, darkMode: true, authToken, isAdmin, compareList, wishlistIds, lastViewedCars });
  },
  darkMode: true,
  activeSection: 'hero',
  setActiveSection: (section: string) => set({ activeSection: section }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (val: boolean) => set({ mobileMenuOpen: val }),
  authToken: null,
  setAuthToken: (token: string | null) => {
    try {
      if (token) {
        localStorage.setItem(`${STORAGE_PREFIX}authToken`, token);
      } else {
        localStorage.removeItem(`${STORAGE_PREFIX}authToken`);
      }
    } catch {}
    set({ authToken: token });
  },
  isAdmin: false,
  setIsAdmin: (val: boolean) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}isAdmin`, String(val));
    } catch {}
    set({ isAdmin: val });
  },
  // Active filters applied to FeaturedCars
  activeFilters: {},
  setActiveFilters: (filters: CarFilters) => set({ activeFilters: filters }),
  clearFilters: () => set({ activeFilters: {} }),
  // Sell Car Modal (admin)
  sellModalOpen: false,
  setSellModalOpen: (val: boolean) => set({ sellModalOpen: val }),
  // Sell/Trade Valuation Modal (customer — C1)
  sellValuationOpen: false,
  setSellValuationOpen: (val: boolean) => set({ sellValuationOpen: val }),
  // Admin Login Modal
  loginModalOpen: false,
  setLoginModalOpen: (val: boolean) => set({ loginModalOpen: val }),
  // Admin Panel
  adminPanelOpen: false,
  setAdminPanelOpen: (val: boolean) => set({ adminPanelOpen: val }),
  // Wishlist (persisted)
  wishlistIds: [],
  toggleWishlist: (carId: string) => {
    const list = get().wishlistIds;
    const next = list.includes(carId) ? list.filter(id => id !== carId) : [...list, carId];
    try { localStorage.setItem(`${STORAGE_PREFIX}wishlist`, JSON.stringify(next)); } catch {}
    set({ wishlistIds: next });
  },
  removeFromWishlist: (carId: string) => {
    const next = get().wishlistIds.filter(id => id !== carId);
    try { localStorage.setItem(`${STORAGE_PREFIX}wishlist`, JSON.stringify(next)); } catch {}
    set({ wishlistIds: next });
  },
  clearWishlist: () => {
    try { localStorage.setItem(`${STORAGE_PREFIX}wishlist`, JSON.stringify([])); } catch {}
    set({ wishlistIds: [] });
  },
  isWishlisted: (carId: string) => get().wishlistIds.includes(carId),
  // Wishlist drawer
  wishlistOpen: false,
  setWishlistOpen: (val: boolean) => set({ wishlistOpen: val }),
  // Car list refresh trigger
  carListVersion: 0,
  bumpCarListVersion: () => set((state) => ({ carListVersion: state.carListVersion + 1 })),
  // Compare feature (persisted)
  compareList: [],
  toggleCompare: (carId: string) => {
    const list = get().compareList;
    let next: string[];
    if (list.includes(carId)) {
      next = list.filter(id => id !== carId);
    } else {
      if (list.length < 4) {
        next = [...list, carId];
      } else {
        return; // max 4, silently reject
      }
    }
    saveCompareList(next);
    set({ compareList: next });
  },
  clearCompare: () => {
    saveCompareList([]);
    set({ compareList: [] });
  },
  // D8: Recently viewed cars (max 8, newest first, deduped)
  lastViewedCars: [],
  addViewedCar: (carId: string) => {
    if (!carId) return;
    const next = [carId, ...get().lastViewedCars.filter(id => id !== carId)].slice(0, 8);
    saveViewedCars(next);
    set({ lastViewedCars: next });
  },
  clearViewedCars: () => {
    saveViewedCars([]);
    set({ lastViewedCars: [] });
  },
}));
