import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import activateSlice from './activateSlice'
export const store = configureStore({
    reducer: {
        authSlice,
        activateSlice
    },
})