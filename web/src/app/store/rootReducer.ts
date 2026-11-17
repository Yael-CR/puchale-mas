
import { combineReducers } from '@reduxjs/toolkit'

import preferencesReducer from '../../features/preferences/store/preferencesSlice'
import auctionsReducer from '../../features/auctions/store/auctionsSlice'

export const rootReducer = combineReducers({
  preferences: preferencesReducer,
  auctions: auctionsReducer,
})
