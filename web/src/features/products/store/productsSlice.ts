
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { productService } from '../api/productService'

import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductImage,
  ProductImageReorder,
} from '../types/product'

interface ProductsState {
  items: Product[]
  myProducts: Product[]

  loading: boolean
  saving: boolean
  error: string | null

  images: ProductImage[]
  imagesLoading: boolean
  imagesSaving: boolean
  imagesError: string | null
}

const initialState: ProductsState = {
  items: [],
  myProducts: [],

  loading: false,
  saving: false,
  error: null,

  images: [],
  imagesLoading: false,
  imagesSaving: false,
  imagesError: null,
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
    {
      productId,
      payload,
    }: {
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

// ==============================
// IMÁGENES DEL PRODUCTO
// ==============================

// CARGAR GALERÍA
export const fetchProductImages = createAsyncThunk(
  'products/fetchProductImages',
  async (productId: string, { rejectWithValue }) => {
    try {
      const images = await productService.getProductImages(productId)

      return { productId, images }
    } catch {
      return rejectWithValue('No se pudieron cargar las imágenes.')
    }
  },
)

// SUBIR IMAGEN
export const uploadProductImage = createAsyncThunk(
  'products/uploadProductImage',
  async (
    {
      productId,
      file,
    }: {
      productId: string
      file: File
    },
    { rejectWithValue },
  ) => {
    try {
      return await productService.uploadProductImage(productId, file)
    } catch {
      return rejectWithValue('No se pudo subir la imagen.')
    }
  },
)

// REEMPLAZAR IMAGEN
export const replaceProductImage = createAsyncThunk(
  'products/replaceProductImage',
  async (
    {
      productId,
      imageId,
      file,
    }: {
      productId: string
      imageId: string
      file: File
    },
    { rejectWithValue },
  ) => {
    try {
      return await productService.replaceProductImage(
        productId,
        imageId,
        file,
      )
    } catch {
      return rejectWithValue('No se pudo reemplazar la imagen.')
    }
  },
)

// ELIMINAR IMAGEN
export const deleteProductImage = createAsyncThunk(
  'products/deleteProductImage',
  async (
    {
      productId,
      imageId,
    }: {
      productId: string
      imageId: string
    },
    { rejectWithValue },
  ) => {
    try {
      await productService.deleteProductImage(productId, imageId)

      return { productId, imageId }
    } catch {
      return rejectWithValue('No se pudo eliminar la imagen.')
    }
  },
)

// REORDENAR GALERÍA
export const reorderProductImages = createAsyncThunk(
  'products/reorderProductImages',
  async (
    {
      productId,
      payload,
    }: {
      productId: string
      payload: ProductImageReorder
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await productService.reorderProductImages(
        productId,
        payload,
      )

      return response.images
    } catch {
      return rejectWithValue('No se pudo reordenar la galería.')
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

    clearProductImagesError(state) {
      state.imagesError = null
    },

    clearProductImages(state) {
      state.images = []
      state.imagesError = null
      state.imagesLoading = false
      state.imagesSaving = false
    },
  },

  extraReducers: (builder) => {
    builder
      // ==============================
      // CATÁLOGO
      // ==============================

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

      // ==============================
      // PRODUCTOS PROPIOS
      // ==============================

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

      // ==============================
      // CREACIÓN
      // ==============================

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

      // ==============================
      // ACTUALIZACIÓN
      // ==============================

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

      // ==============================
      // PUBLICACIÓN
      // ==============================

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

      // ==============================
      // ARCHIVADO
      // ==============================

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

      // ==============================
      // CARGAR IMÁGENES
      // ==============================

      .addCase(fetchProductImages.pending, (state) => {
        state.imagesLoading = true
        state.imagesError = null
      })
      .addCase(fetchProductImages.fulfilled, (state, action) => {
        state.imagesLoading = false
        state.images = action.payload.images
      })
      .addCase(fetchProductImages.rejected, (state, action) => {
        state.imagesLoading = false
        state.imagesError = action.payload as string
      })

      // ==============================
      // SUBIR IMAGEN
      // ==============================

      .addCase(uploadProductImage.pending, (state) => {
        state.imagesSaving = true
        state.imagesError = null
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.imagesSaving = false
        state.images.push(action.payload)
        state.images.sort((a, b) => a.position - b.position)
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.imagesSaving = false
        state.imagesError = action.payload as string
      })

      // ==============================
      // REEMPLAZAR IMAGEN
      // ==============================

      .addCase(replaceProductImage.pending, (state) => {
        state.imagesSaving = true
        state.imagesError = null
      })
      .addCase(replaceProductImage.fulfilled, (state, action) => {
        state.imagesSaving = false

        const index = state.images.findIndex(
          (image) => image.id === action.payload.id,
        )

        if (index !== -1) {
          state.images[index] = action.payload
        }
      })
      .addCase(replaceProductImage.rejected, (state, action) => {
        state.imagesSaving = false
        state.imagesError = action.payload as string
      })

      // ==============================
      // ELIMINAR IMAGEN
      // ==============================

      .addCase(deleteProductImage.pending, (state) => {
        state.imagesSaving = true
        state.imagesError = null
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.imagesSaving = false

        state.images = state.images.filter(
          (image) => image.id !== action.payload.imageId,
        )
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.imagesSaving = false
        state.imagesError = action.payload as string
      })

      // ==============================
      // REORDENAR GALERÍA
      // ==============================

      .addCase(reorderProductImages.pending, (state) => {
        state.imagesSaving = true
        state.imagesError = null
      })
      .addCase(reorderProductImages.fulfilled, (state, action) => {
        state.imagesSaving = false
        state.images = action.payload
      })
      .addCase(reorderProductImages.rejected, (state, action) => {
        state.imagesSaving = false
        state.imagesError = action.payload as string
      })
  },
})

export const {
  clearProductsError,
  clearProductImagesError,
  clearProductImages,
} = productsSlice.actions

export default productsSlice.reducer
