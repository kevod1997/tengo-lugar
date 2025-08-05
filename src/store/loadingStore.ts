import { create } from 'zustand';

// Definimos todas las posibles operaciones de carga en la aplicación
export type LoadingOperation = 
  | 'calculatingRoute'
  | 'geocodingOrigin'
  | 'geocodingDestination'
  | 'creatingTrip'
  | 'fetchingCars'
  | 'fetchingFuelPrices'
  | 'uploadingDocument'
  | 'authRedirect'
  | 'authenticatingUser'
  | 'fetchingUserData'
  | 'signingOut'
  | (string & {});

interface LoadingState {
  // Registro de operaciones en carga
  operations: Record<LoadingOperation, boolean>;
  
  // Métodos para controlar el estado
  isLoading: (operation: LoadingOperation) => boolean;
  setLoading: (operation: LoadingOperation, loading: boolean) => void;
  startLoading: (operation: LoadingOperation) => void;
  stopLoading: (operation: LoadingOperation) => void;
  resetAll: () => void;
  
  // Opcional: mapeo de mensajes personalizados por operación
  loadingMessages: Record<LoadingOperation, string>;
  setLoadingMessage: (operation: LoadingOperation, message: string) => void;
  getLoadingMessage: (operation: LoadingOperation) => string;
}

// Mensajes por defecto
const defaultMessages: Record<LoadingOperation, string> = {
  calculatingRoute: 'Calculando ruta...',
  geocodingOrigin: 'Obteniendo coordenadas de origen...',
  geocodingDestination: 'Obteniendo coordenadas de destino...',
  creatingTrip: 'Creando viaje...',
  fetchingCars: 'Cargando vehículos...',
  fetchingFuelPrices: 'Cargando precios de combustible...',
  uploadingDocument: 'Subiendo documento...',
  authRedirect: 'Autenticando...',
  authenticatingUser: 'Autenticando...',
  fetchingUserData: 'Cargando datos de usuario...',
  searchingTrips: 'Buscando viajes...',
  signingOut: 'Cerrando sesión...',
   navigatingToTrip: 'Cargando detalles del viaje...',
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
  operations: Object.fromEntries(
    ([
      'calculatingRoute',
      'geocodingOrigin',
      'geocodingDestination',
      'creatingTrip',
      'fetchingCars',
      'fetchingFuelPrices',
      'uploadingDocument',
      'authenticatingUser',
      'fetchingUserData',
    ] as LoadingOperation[]).map((key) => [key, false])
  ) as Record<LoadingOperation, boolean>,
  loadingMessages: { ...defaultMessages },
  
  isLoading: (operation) => !!get().operations[operation],
  
  setLoading: (operation, loading) => {
    set((state) => {
      const newOperations = { ...state.operations };
      
      if (loading) {
        newOperations[operation] = true;
      } else {
        delete newOperations[operation];
      }
      
      return { operations: newOperations };
    });
  },
  
  startLoading: (operation) => {
    get().setLoading(operation, true);
  },
  
  stopLoading: (operation) => {
    get().setLoading(operation, false);
  },
  
  resetAll: () => set({ operations: Object.fromEntries(Object.keys(defaultMessages).map((key) => [key, false])) as Record<LoadingOperation, boolean> }),
  
  setLoadingMessage: (operation, message) => {
    set((state) => ({
      loadingMessages: {
        ...state.loadingMessages,
        [operation]: message
      }
    }));
  },
  
  getLoadingMessage: (operation) => {
    return get().loadingMessages[operation] || 'Cargando...';
  }
}));