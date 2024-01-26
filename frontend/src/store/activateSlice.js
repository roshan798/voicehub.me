import { createSlice } from '@reduxjs/toolkit'
import defaultAvatar from "../assets/Images/avatar.jpeg";

const initialState = {
    name: "",
    avatar: defaultAvatar,
}

export const activateSlice = createSlice({
    name: 'activate',
    initialState,
    reducers: {
        setName: (state, action) => {
            state.name = action.payload
        },
        setAvatar: (state, action) => {
            state.avatar = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const { setName, setAvatar } = activateSlice.actions

export default activateSlice.reducer