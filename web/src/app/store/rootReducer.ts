import { combineReducers } from '@reduxjs/toolkit'

import preferencesReducer from '../../features/preferences/store/preferencesSlice'

export const rootReducer = combineReducers({
  preferences: preferencesReducer,
})