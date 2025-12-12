---
paths: "{src/store/**,src/hooks/**,src/components/**/*.tsx,src/app/**/*.tsx}"
---

# State Management Rules

## 🎯 Applies To

- `src/store/` - Zustand stores (UI state only)
- `src/hooks/` - Custom React hooks
- `src/components/` - React components consuming state
- `src/app/` - App Router pages/layouts consuming state

## 🔴 CRITICAL - Never Violate

1. **NEVER use Zustand for server state** - Use React Query instead
   ```typescript
   ❌ // Zustand for server data
   const useTripsStore = create((set) => ({
     trips: [],
     fetchTrips: async () => {
       const trips = await fetch('/api/trips');
       set({ trips });
     }
   }));

   ✅ // React Query for server data
   const { data: trips } = useQuery({
     queryKey: ['trips'],
     queryFn: async () => {
       const result = await getTrips();
       return result.data;
     }
   });
   ```

2. **NEVER store authentication state in Zustand** - Auth is server-side only
   ```typescript
   ❌ const useAuthStore = create((set) => ({
        user: null,
        login: (user) => set({ user })
      }));

   ✅ // Use better-auth session (server-side)
   const session = await auth.api.getSession({ ... });
   ```

3. **NEVER duplicate server data in Zustand** - React Query is the single source of truth
   ```typescript
   ❌ const { data: trips } = useQuery(['trips'], fetchTrips);
      const setTrips = useStore(state => state.setTrips);
      useEffect(() => setTrips(trips), [trips]); // Duplicating!

   ✅ const { data: trips } = useQuery(['trips'], fetchTrips);
      // Use trips directly, no duplication
   ```

4. **NEVER use client state for derived server data** - Use React Query `select`
   ```typescript
   ❌ const trips = useStore(state => state.trips);
      const pendingTrips = trips.filter(t => t.status === 'PENDING'); // Client filtering

   ✅ const { data: pendingTrips } = useQuery({
        queryKey: ['trips', 'pending'],
        queryFn: fetchTrips,
        select: (data) => data.filter(t => t.status === 'PENDING')
      });
   ```

5. **NEVER create global UI state for component-specific concerns** - Use local state
   ```typescript
   ❌ // Global store for component state
   const useModalStore = create((set) => ({
     isProfileModalOpen: false,
     isSettingsModalOpen: false,
     // ... 50 more modal states
   }));

   ✅ // Local component state
   const [isOpen, setIsOpen] = useState(false);
   ```

## 🟡 MANDATORY - Always Follow

1. **ALWAYS use React Query for server state** (data from database or APIs)
   - User data, trips, payments, notifications
   - Any data that comes from Server Actions
   - Any data that needs caching/revalidation

2. **ALWAYS use Zustand for UI state** (client-only state)
   - Sidebar open/closed
   - Active tab selection
   - Modal visibility
   - Form draft data (not submitted)
   - Theme preferences

3. **ALWAYS invalidate queries after mutations**
   ```typescript
   const { mutate } = useMutation({
     mutationFn: updateTrip,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['trips'] });
       queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
     }
   });
   ```

4. **ALWAYS use optimistic updates for better UX**
   ```typescript
   const { mutate } = useMutation({
     mutationFn: updateTrip,
     onMutate: async (newData) => {
       await queryClient.cancelQueries({ queryKey: ['trip', id] });
       const previous = queryClient.getQueryData(['trip', id]);
       queryClient.setQueryData(['trip', id], newData);
       return { previous };
     },
     onError: (err, newData, context) => {
       queryClient.setQueryData(['trip', id], context.previous);
     }
   });
   ```

5. **ALWAYS structure Zustand stores by feature/domain**
   ```typescript
   // ✅ GOOD: Organized by feature
   src/store/
   ├── sidebar-store.ts    # Sidebar UI state
   ├── theme-store.ts      # Theme preferences
   └── draft-store.ts      # Form drafts

   // ❌ BAD: One massive store
   src/store/
   └── global-store.ts     # Everything in one file
   ```

## 🎯 Decision Tree: React Query vs Zustand vs Local State

```
Where does this data come from?

├─ SERVER (database/API)
│  └─ Use React Query ✅
│      Examples: User profile, trips list, payment history
│
├─ CLIENT (UI state)
│  │
│  ├─ Shared across multiple components?
│  │  └─ YES → Use Zustand ✅
│  │      Examples: Sidebar open, theme, global modals
│  │
│  └─ Component-specific?
│      └─ YES → Use local useState ✅
│          Examples: Form input, local modal, hover state
│
└─ DERIVED from server data?
    └─ Use React Query with `select` ✅
        Examples: Filtered lists, sorted data, computed values
```

## ✅ Quick Pattern: React Query Hook

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTrips, updateTrip } from '@/actions/trip-actions';

export function useTrips(status?: string) {
  return useQuery({
    queryKey: ['trips', status],
    queryFn: async () => {
      const result = await getTrips();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    select: (data) => {
      if (status) return data.filter(trip => trip.status === status);
      return data;
    }
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrip,
    onSuccess: (result, variables) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
    }
  });
}
```

## ✅ Quick Pattern: Zustand Store

```typescript
// src/store/sidebar-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false })
    }),
    {
      name: 'sidebar-storage' // Persist to localStorage
    }
  )
);
```

## 🔗 Detailed Documentation

For complete state management patterns, see:
- [state-management.md](../../docs/agent/patterns/state-management.md) - Zustand patterns and organization
- [data-fetching.md](../../docs/agent/patterns/data-fetching.md) - React Query comprehensive guide

## ❌ Common State Management Mistakes

- **Mistake**: Using Zustand for trips/user/server data
  - **Why**: No automatic caching, revalidation, or deduplication
  - **Fix**: Use React Query for ALL server data

- **Mistake**: Storing auth state in client
  - **Why**: Auth is server-side only with better-auth
  - **Fix**: Get session from server, never store in client state

- **Mistake**: Not invalidating queries after mutations
  - **Why**: Stale data displayed to user
  - **Fix**: Always invalidate in `onSuccess`

- **Mistake**: Creating global state for component-local concerns
  - **Why**: Unnecessary complexity, hard to maintain
  - **Fix**: Use `useState` for component-specific state

## 📋 State Management Checklist

Before marking state management work complete:

- [ ] Server data uses React Query (not Zustand)
- [ ] UI state uses Zustand (not React Query)
- [ ] Component-local state uses useState
- [ ] No auth state in client stores
- [ ] Queries invalidated after mutations
- [ ] Query keys are consistent and meaningful
- [ ] Zustand stores organized by feature/domain
- [ ] Optimistic updates implemented for mutations
- [ ] No duplicated data between React Query and Zustand
- [ ] Derived data uses React Query `select`, not client computation
