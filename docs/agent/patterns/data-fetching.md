# Data Fetching Patterns

## Overview
Tengo Lugar uses **@tanstack/react-query 5.64.1** for server state management and **React Hook Form 7.53.2** with **Zod** for form handling.

---

## React Query Patterns

### Basic Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { getUserTrips } from "@/actions/trip/get-user-trips";

function TripsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trips', userId],
    queryFn: () => getUserTrips(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return <TripsList trips={data} />;
}
```

### Query with Parameters

```typescript
const { data: trip } = useQuery({
  queryKey: ['trip', tripId],
  queryFn: () => getTripDetails(tripId),
  staleTime: 2 * 60 * 1000, // 2 minutes
  enabled: !!tripId, // Only run if tripId exists
});
```

### Mutations with Optimistic Updates

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrip } from "@/actions/trip/create-trip";
import { toast } from "sonner";

function CreateTripForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (data) => {
      // Invalidate and refetch trips list
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Viaje creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear viaje');
    }
  });

  const handleSubmit = (tripData) => {
    mutation.mutate(tripData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creando...' : 'Crear Viaje'}
      </button>
    </form>
  );
}
```

### Optimistic UI Updates

```typescript
const updateTripMutation = useMutation({
  mutationFn: updateTrip,
  onMutate: async (updatedTrip) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['trip', updatedTrip.id] });

    // Snapshot previous value
    const previousTrip = queryClient.getQueryData(['trip', updatedTrip.id]);

    // Optimistically update
    queryClient.setQueryData(['trip', updatedTrip.id], updatedTrip);

    // Return context with previous value
    return { previousTrip };
  },
  onError: (err, updatedTrip, context) => {
    // Rollback on error
    queryClient.setQueryData(['trip', updatedTrip.id], context.previousTrip);
    toast.error('Error al actualizar viaje');
  },
  onSettled: (data, error, variables) => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
  }
});
```

---

## Form Validation Pattern

### Basic Form with Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema } from "@/schemas/validation/trip-schema";
import { z } from "zod";

type TripFormData = z.infer<typeof tripSchema>;

function TripForm() {
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      origin: '',
      destination: '',
      departureDate: new Date(),
      availableSeats: 1,
      pricePerSeat: 0
    }
  });

  const onSubmit = async (data: TripFormData) => {
    const result = await createTrip(data);

    if (result.success) {
      toast.success(result.message);
      form.reset();
    } else {
      toast.error(result.error?.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('origin')} />
      {form.formState.errors.origin && (
        <span>{form.formState.errors.origin.message}</span>
      )}

      {/* More fields */}

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

### Form with shadcn/ui Components

```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function TripForm() {
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: { /* ... */ }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="origin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origen</FormLabel>
              <FormControl>
                <Input placeholder="Ciudad de origen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destino</FormLabel>
              <FormControl>
                <Input placeholder="Ciudad de destino" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Crear Viaje
        </Button>
      </form>
    </Form>
  );
}
```

---

## Query Invalidation Strategies

### Invalidate Specific Query

```typescript
// After creating a trip
queryClient.invalidateQueries({ queryKey: ['trips'] });
```

### Invalidate Multiple Related Queries

```typescript
// After updating user profile
queryClient.invalidateQueries({ queryKey: ['user'] });
queryClient.invalidateQueries({ queryKey: ['trips', userId] });
queryClient.invalidateQueries({ queryKey: ['driver', driverId] });
```

### Invalidate with Filters

```typescript
// Invalidate all trip-related queries
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'trips'
});
```

### Selective Refetch

```typescript
// Only refetch active queries
queryClient.invalidateQueries({
  queryKey: ['trips'],
  refetchType: 'active'
});
```

---

## Loading States

### Query Loading States

```typescript
const { data, isLoading, isFetching, isError, error } = useQuery({
  queryKey: ['trips'],
  queryFn: getUserTrips
});

if (isLoading) {
  return <FullPageLoader />; // Initial load
}

if (isError) {
  return <ErrorDisplay error={error} />;
}

return (
  <>
    {isFetching && <RefreshIndicator />} {/* Background refetch */}
    <TripsList trips={data} />
  </>
);
```

### Mutation Loading States

```typescript
const mutation = useMutation({ mutationFn: createTrip });

<Button
  onClick={() => mutation.mutate(tripData)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Creando...
    </>
  ) : (
    'Crear Viaje'
  )}
</Button>
```

---

## Error Handling

### Query Error Boundaries

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

function TripsPage() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>Error: {error.message}</p>
              <Button onClick={resetErrorBoundary}>Reintentar</Button>
            </div>
          )}
        >
          <TripsContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### Retry Configuration

```typescript
const { data } = useQuery({
  queryKey: ['trips'],
  queryFn: getUserTrips,
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## Dependent Queries

### Sequential Queries

```typescript
// First query
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => getUser(userId)
});

// Second query depends on first
const { data: trips } = useQuery({
  queryKey: ['trips', user?.driver?.id],
  queryFn: () => getDriverTrips(user!.driver!.id),
  enabled: !!user?.driver?.id, // Only run if driver exists
});
```

### Parallel Queries

```typescript
function Dashboard() {
  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: getUser
  });

  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: getUserTrips
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: getUserStats
  });

  const isLoading = userQuery.isLoading || tripsQuery.isLoading || statsQuery.isLoading;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <UserProfile user={userQuery.data} />
      <TripsList trips={tripsQuery.data} />
      <StatsWidget stats={statsQuery.data} />
    </div>
  );
}
```

---

## Pagination Patterns

### Offset Pagination

```typescript
function TripsList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['trips', page],
    queryFn: () => getTrips({ page, pageSize }),
    keepPreviousData: true, // Show previous data while loading next page
  });

  return (
    <>
      <TripsGrid trips={data?.trips} />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Infinite Scroll

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

function InfiniteTrips() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['trips', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getTrips({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  return (
    <>
      {data?.pages.map((page) => (
        page.trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
      ))}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </Button>
      )}
    </>
  );
}
```

---

## Prefetching

### Prefetch on Hover

```typescript
function TripCard({ trip }) {
  const queryClient = useQueryClient();

  const prefetchTripDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['trip', trip.id],
      queryFn: () => getTripDetails(trip.id),
    });
  };

  return (
    <Link
      href={`/trips/${trip.id}`}
      onMouseEnter={prefetchTripDetails}
    >
      {trip.origin} → {trip.destination}
    </Link>
  );
}
```

### Prefetch on Route Change

```typescript
import { useRouter } from 'next/navigation';

function useTripsNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const navigateToTrips = async () => {
    // Prefetch before navigation
    await queryClient.prefetchQuery({
      queryKey: ['trips'],
      queryFn: getUserTrips,
    });

    router.push('/trips');
  };

  return { navigateToTrips };
}
```

---

## Best Practices

### 1. Query Key Organization

```typescript
// Hierarchical query keys
const queryKeys = {
  trips: ['trips'] as const,
  trip: (id: string) => ['trips', id] as const,
  userTrips: (userId: string) => ['trips', 'user', userId] as const,
  driverTrips: (driverId: string) => ['trips', 'driver', driverId] as const,
};

// Usage
const { data } = useQuery({
  queryKey: queryKeys.trip(tripId),
  queryFn: () => getTripDetails(tripId)
});
```

### 2. Appropriate Stale Times

```typescript
// Frequently changing: Short stale time
useQuery({
  queryKey: ['active-sessions'],
  queryFn: getActiveSessions,
  staleTime: 30 * 1000, // 30 seconds
});

// Rarely changing: Long stale time
useQuery({
  queryKey: ['car-brands'],
  queryFn: getCarBrands,
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
});
```

### 3. Don't Mix Server State in Zustand

```typescript
// ❌ BAD: Server state in Zustand
const useStore = create((set) => ({
  trips: [],
  fetchTrips: async () => {
    const trips = await getUserTrips();
    set({ trips });
  }
}));

// ✅ GOOD: Use React Query for server state
const { data: trips } = useQuery({
  queryKey: ['trips'],
  queryFn: getUserTrips
});
```

---

## Related Documentation

- [State Management](state-management.md) - Zustand for client state
- [Server Actions](server-actions.md) - Creating query functions
- [Forms](../reference/form-patterns.md) - Advanced form patterns
