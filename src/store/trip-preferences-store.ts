import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TripPreferencesState {
  availableSeats: number
  luggageAllowance: string
  allowPets: boolean
  allowChildren: boolean
  smokingAllowed: boolean
  autoApproveReservations: boolean
  additionalNotes: string
  
  // Acciones
  setAvailableSeats: (seats: number) => void
  setLuggageAllowance: (allowance: string) => void
  togglePets: () => void
  toggleChildren: () => void
  toggleSmoking: () => void
  toggleAutoApprove: () => void
  setAdditionalNotes: (notes: string) => void
  updateMultiple: (updates: Partial<Omit<TripPreferencesState, 
    'setAvailableSeats' | 'setLuggageAllowance' | 'togglePets' | 
    'toggleChildren' | 'toggleSmoking' | 'toggleAutoApprove' | 
    'setAdditionalNotes' | 'updateMultiple' | 'reset'>>) => void
  reset: () => void
}

// Valores iniciales
const initialState = {
  availableSeats: 4,
  luggageAllowance: 'MEDIUM',
  allowPets: false,
  allowChildren: true,
  smokingAllowed: false,
  autoApproveReservations: false,
  additionalNotes: '',
}

export const useTripPreferencesStore = create<TripPreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAvailableSeats: (seats) => set({ availableSeats: seats }),
      setLuggageAllowance: (allowance) => set({ luggageAllowance: allowance }),
      togglePets: () => set((state) => ({ allowPets: !state.allowPets })),
      toggleChildren: () => set((state) => ({ allowChildren: !state.allowChildren })),
      toggleSmoking: () => set((state) => ({ smokingAllowed: !state.smokingAllowed })),
      toggleAutoApprove: () => set((state) => ({ 
        autoApproveReservations: !state.autoApproveReservations 
      })),
      setAdditionalNotes: (notes) => set({ additionalNotes: notes }),
      
      updateMultiple: (updates) => set((state) => ({ ...state, ...updates })),
      reset: () => set(initialState)
    }),
    {
      name: 'trip-preferences-storage', // nombre para localStorage
      partialize: (state) => ({
        // Guardar solo ciertos valores en localStorage
        availableSeats: state.availableSeats,
        luggageAllowance: state.luggageAllowance,
        allowPets: state.allowPets,
        allowChildren: state.allowChildren,
        smokingAllowed: state.smokingAllowed,
        autoApproveReservations: state.autoApproveReservations
      })
    }
  )
)