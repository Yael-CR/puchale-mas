
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getAuctions,
  getAuctionById,
} from '../api/auctionService'
import type { Auction } from '../types/auction'

// ==========================================
// Obtener catálogo de subastas
// ==========================================
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await getAuctions()
    } catch {
      return thunkAPI.rejectWithValue(
        'No fue posible cargar el catálogo de subastas.',
      )
    }
  },
)

// ==========================================
// Obtener detalle de una subasta
// ==========================================
export const fetchAuctionById = createAsyncThunk(
  'auctions/fetchById',
  async (auctionId: string, thunkAPI) => {
    try {
      return await getAuctionById(auctionId)
    } catch {
      return thunkAPI.rejectWithValue(
        'No fue posible cargar el detalle de la subasta.',
      )
    }
  },
)

interface AuctionsState {
  items: Auction[]
  selectedAuction: Auction | null
  loading: boolean
  detailLoading: boolean
  error: string | null
}

const initialState: AuctionsState = {
  items: [],
  selectedAuction: null,
  loading: false,
  detailLoading: false,
  error: null,
}

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    clearAuctionDetail(state) {
      state.selectedAuction = null
      state.error = null
    },
    clearAuctionsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchAuctionById.pending, (state) => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.selectedAuction = action.payload
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearAuctionDetail,
  clearAuctionsError,
} = auctionsSlice.actions

export default auctionsSlice.reducer
