import { create } from 'zustand'
import type { CustomerSortBy, RFMSegment } from '@merx/types'

interface CustomersListState {
  searchInput: string
  sortBy: CustomerSortBy
  segment: RFMSegment | 'all'
  page: number

  setSearchInput: (v: string) => void
  setSortBy: (v: CustomerSortBy) => void
  setSegment: (v: RFMSegment | 'all') => void
  setPage: (v: number) => void
}

export const useCustomersListStore = create<CustomersListState>()((set) => ({
  searchInput: '',
  sortBy: 'ltv',
  segment: 'all',
  page: 1,

  setSearchInput: (v) => set({ searchInput: v, page: 1 }),
  setSortBy: (v) => set({ sortBy: v, page: 1 }),
  setSegment: (v) => set({ segment: v, page: 1 }),
  setPage: (v) => set({ page: v }),
}))
