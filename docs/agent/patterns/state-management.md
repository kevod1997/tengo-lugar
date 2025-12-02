# State Management Patterns

## Overview
Tengo Lugar uses **Zustand 5.0.3** for client-side global state management.

**Important**: Use Zustand ONLY for client-side state. Use React Query for server state.

---

## When to Use Zustand

### ✅ Use Zustand For:
- UI state (theme, modals, sidebar open/closed)
- User preferences (language, display settings)
- Client-side form state across components
- Temporary client data (search filters, selected items)
- App-wide UI configuration

### ❌ Don't Use Zustand For:
- Server data (trips, users, cars) → Use React Query
- Authentication state → Use auth helpers
- Database records → Use React Query
- API responses → Use React Query

---

## Basic Store Pattern

### Simple Store

```typescript
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
```

**Usage:**
```typescript
function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={isSidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

---

## Persistent Store Pattern

### Store with LocalStorage

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'es' | 'en') => void;
}

export const usePreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'es',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'user-preferences', // LocalStorage key
    }
  )
);
```

---

## Common Store Patterns

### Modal Management Store

```typescript
interface ModalState {
  modals: {
    createTrip: boolean;
    editProfile: boolean;
    confirmDelete: boolean;
  };
  openModal: (modal: keyof ModalState['modals']) => void;
  closeModal: (modal: keyof ModalState['modals']) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  modals: {
    createTrip: false,
    editProfile: false,
    confirmDelete: false,
  },
  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true },
    })),
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false },
    })),
  closeAllModals: () =>
    set({
      modals: {
        createTrip: false,
        editProfile: false,
        confirmDelete: false,
      },
    }),
}));
```

**Usage:**
```typescript
function CreateTripButton() {
  const openModal = useModalStore((state) => state.openModal);

  return <Button onClick={() => openModal('createTrip')}>Crear Viaje</Button>;
}

function CreateTripModal() {
  const { modals, closeModal } = useModalStore();

  return (
    <Modal open={modals.createTrip} onClose={() => closeModal('createTrip')}>
      {/* Modal content */}
    </Modal>
  );
}
```

### Search Filter Store

```typescript
interface SearchFilters {
  origin: string;
  destination: string;
  date: Date | null;
  minSeats: number;
  maxPrice: number;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  setDate: (date: Date | null) => void;
  setMinSeats: (seats: number) => void;
  setMaxPrice: (price: number) => void;
  resetFilters: () => void;
}

const initialState = {
  origin: '',
  destination: '',
  date: null,
  minSeats: 1,
  maxPrice: 10000,
};

export const useSearchStore = create<SearchFilters>()((set) => ({
  ...initialState,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setDate: (date) => set({ date }),
  setMinSeats: (minSeats) => set({ minSeats }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  resetFilters: () => set(initialState),
}));
```

### Multi-Step Form Store

```typescript
interface TripFormState {
  step: number;
  formData: {
    origin: string;
    destination: string;
    date: Date | null;
    seats: number;
    price: number;
  };
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<TripFormState['formData']>) => void;
  resetForm: () => void;
}

export const useTripFormStore = create<TripFormState>()((set) => ({
  step: 1,
  formData: {
    origin: '',
    destination: '',
    date: null,
    seats: 1,
    price: 0,
  },
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () =>
    set({
      step: 1,
      formData: {
        origin: '',
        destination: '',
        date: null,
        seats: 1,
        price: 0,
      },
    }),
}));
```

---

## Advanced Patterns

### Computed Values with Selectors

```typescript
// Store
interface CartState {
  items: Array<{ id: string; price: number; quantity: number }>;
  addItem: (item: CartState['items'][0]) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

// Computed selector
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((count, item) => count + item.quantity, 0);
```

**Usage:**
```typescript
function CartSummary() {
  const total = useCartStore(selectCartTotal);
  const itemCount = useCartStore(selectCartItemCount);

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: ${total}</p>
    </div>
  );
}
```

### Subscribing to Store Changes

```typescript
import { useEffect } from 'react';

function SyncWithLocalStorage() {
  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = useCartStore.subscribe((state) => {
      localStorage.setItem('cart', JSON.stringify(state.items));
    });

    return unsubscribe;
  }, []);

  return null;
}
```

### Middleware: Logging

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    (set) => ({
      // Store implementation
    }),
    { name: 'MyStore' } // Shows in Redux DevTools
  )
);
```

---

## Performance Optimization

### Selective Subscription

```typescript
// ❌ BAD: Re-renders on any state change
function Component() {
  const { value1, value2, value3 } = useStore();
  return <div>{value1}</div>; // Re-renders even if value2/value3 change
}

// ✅ GOOD: Only re-renders when value1 changes
function Component() {
  const value1 = useStore((state) => state.value1);
  return <div>{value1}</div>;
}
```

### Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow';

// Multiple values without unnecessary re-renders
function Component() {
  const { value1, value2 } = useStore(
    (state) => ({ value1: state.value1, value2: state.value2 }),
    shallow
  );

  return (
    <div>
      {value1} - {value2}
    </div>
  );
}
```

---

## Store Organization

### Multiple Stores

Create separate stores for different domains:

```typescript
// stores/ui-store.ts
export const useUIStore = create(/* ... */);

// stores/preferences-store.ts
export const usePreferencesStore = create(/* ... */);

// stores/search-store.ts
export const useSearchStore = create(/* ... */);
```

### Store Slices Pattern

For large stores, use slices:

```typescript
// stores/slices/user-slice.ts
export const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

// stores/slices/settings-slice.ts
export const createSettingsSlice = (set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
});

// stores/app-store.ts
import { create } from 'zustand';
import { createUserSlice } from './slices/user-slice';
import { createSettingsSlice } from './slices/settings-slice';

export const useAppStore = create((set) => ({
  ...createUserSlice(set),
  ...createSettingsSlice(set),
}));
```

---

## Testing Stores

### Reset Store in Tests

```typescript
import { useStore } from '@/stores/my-store';

beforeEach(() => {
  // Reset store before each test
  useStore.setState({
    value1: initialValue1,
    value2: initialValue2,
  });
});

test('should update value', () => {
  const { result } = renderHook(() => useStore());

  act(() => {
    result.current.setValue1('new value');
  });

  expect(result.current.value1).toBe('new value');
});
```

---

## Common Patterns to Avoid

### ❌ Don't Store Server Data

```typescript
// ❌ BAD: Server data in Zustand
const useStore = create((set) => ({
  trips: [],
  fetchTrips: async () => {
    const trips = await getTrips();
    set({ trips });
  },
}));

// ✅ GOOD: Use React Query
const { data: trips } = useQuery({
  queryKey: ['trips'],
  queryFn: getTrips,
});
```

### ❌ Don't Duplicate Auth State

```typescript
// ❌ BAD: Duplicating auth state
const useStore = create((set) => ({
  currentUser: null,
  isAuthenticated: false,
  // ...
}));

// ✅ GOOD: Use auth helpers
const session = await requireAuthentication('file.ts', 'func');
```

### ❌ Don't Create God Objects

```typescript
// ❌ BAD: Everything in one store
const useStore = create((set) => ({
  ui: { /* 50 properties */ },
  user: { /* 30 properties */ },
  trips: { /* 40 properties */ },
  // Too much!
}));

// ✅ GOOD: Separate stores
const useUIStore = create(/* ... */);
const useUserStore = create(/* ... */);
const useTripsStore = create(/* ... */);
```

---

## Example: Complete UI Store

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  activeModal: string | null;
  openModal: (modal: string) => void;
  closeModal: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Notifications
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Modals
      activeModal: null,
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }), // Only persist theme and sidebar state
    }
  )
);
```

---

## Related Documentation

- [Data Fetching](data-fetching.md) - React Query for server state
- [Authentication](authentication.md) - Auth state management
