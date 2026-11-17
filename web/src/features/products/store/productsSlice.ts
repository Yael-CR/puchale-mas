
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { productService } from '../api/productService'

import type {
  Product,
  ProductCreate,
  ProductUpdate,
} from '../types/product'

interface ProductsState {
  items: Product[]
  myProducts: Product[]
  loading: boolean
  saving: boolean
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  myProducts: [],
  loading: false,
  saving: false,
  error: null,
}

// CATÁLOGO PÚBLICO
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getProducts()
    } catch {
      return rejectWithValue('No se pudieron cargar los productos.')
    }
  },
)

// PRODUCTOS DEL VENDEDOR
export const fetchMyProducts = createAsyncThunk(
  'products/fetchMyProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getMyProducts()
    } catch {
      return rejectWithValue('No se pudieron cargar tus productos.')
    }
  },
)

// CREAR PRODUCTO
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (payload: ProductCreate, { rejectWithValue }) => {
    try {
      return await productService.createProduct(payload)
    } catch {
      return rejectWithValue('No se pudo crear el producto.')
    }
  },
)

// ACTUALIZAR PRODUCTO
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    { productId, payload }: {
      productId: string
      payload: ProductUpdate
    },
    { rejectWithValue },
  ) => {
    try {
      return await productService.updateProduct(productId, payload)
    } catch {
      return rejectWithValue('No se pudo actualizar el producto.')
    }
  },
)

// PUBLICAR PRODUCTO
export const publishProduct = createAsyncThunk(
  'products/publishProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await productService.publishProduct(productId)
    } catch {
      return rejectWithValue('No se pudo publicar el producto.')
    }
  },
)

// ARCHIVAR PRODUCTO
export const archiveProduct = createAsyncThunk(
  'products/archiveProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await productService.archiveProduct(productId)
    } catch {
      return rejectWithValue('No se pudo archivar el producto.')
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // CARGA DE CATÁLOGO
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // CARGA DE PRODUCTOS PROPIOS
      .addCase(fetchMyProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.loading = false
        state.myProducts = action.payload
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // CREACIÓN
      .addCase(createProduct.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.saving = false
        state.myProducts.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })

      // ACTUALIZACIÓN
      .addCase(updateProduct.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saving = false

        const index = state.myProducts.findIndex(
          (product) => product.id === action.payload.id,
        )

        if (index !== -1) {
          state.myProducts[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })

      // PUBLICACIÓN
      .addCase(publishProduct.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(publishProduct.fulfilled, (state, action) => {
        state.saving = false

        const index = state.myProducts.findIndex(
          (product) => product.id === action.payload.id,
        )

        if (index !== -1) {
          state.myProducts[index] = action.payload
        }
      })
      .addCase(publishProduct.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })

      // ARCHIVADO
      .addCase(archiveProduct.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(archiveProduct.fulfilled, (state, action) => {
        state.saving = false

        const index = state.myProducts.findIndex(
          (product) => product.id === action.payload.id,
        )

        if (index !== -1) {
          state.myProducts[index] = action.payload
        }
      })
      .addCase(archiveProduct.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  },
})

export const { clearProductsError } = productsSlice.actions

export default productsSlice.reducer
