import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isAuth: false,
    user: null,
    otp: {

    }
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {

            const { user } = action.payload.data;
            state.user = user;
            if (user === null) {
                state.isAuth = false
            }
            else {
                state.isAuth = true;
            }

        },
        setOtp: (state, action) => {
            const { hash, sender } = action.payload;
            state.otp.sender = sender;
            state.otp.hash = hash;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setAuth, setOtp } = authSlice.actions

export default authSlice.reducer