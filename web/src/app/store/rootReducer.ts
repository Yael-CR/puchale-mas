
import { combineReducers } from '@reduxjs/toolkit'

import preferencesReducer from '../../features/preferences/store/preferencesSlice'
import auctionsReducer from '../../features/auctions/store/auctionsSlice'
import productsReducer from '../../features/products/store/productsSlice'






export const rootReducer = combineReducers({
  preferences: preferencesReducer,
  auctions: auctionsReducer,
  products: productsReducer,


})
