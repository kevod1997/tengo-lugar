import { create } from 'zustand'

import { getInsuranceCompanies } from '@/actions/insurance/get-insurance';

interface InsuranceState {
  companies: Array<{ id: string; name: string }>
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
}

export const useInsuranceStore = create<InsuranceState>((set) => ({
  companies: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    try {
      set({ isLoading: true })
      const data = await getInsuranceCompanies()
      set({ companies: data, isLoading: false })
    } catch (error) {
      console.log(error)
      set({ error: 'Error fetching insurance companies', isLoading: false })
    }
  }
}))