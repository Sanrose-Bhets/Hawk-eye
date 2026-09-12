import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/lib/types"

interface UserState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User
        accessToken: string
        refreshToken: string
      }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
    },
  },
})

export const { setCredentials, clearCredentials } = userSlice.actions

export const selectCurrentUser = (state: { user: UserState }) => state.user.user
export const selectAccessToken = (state: { user: UserState }) => state.user.accessToken
export const selectRefreshToken = (state: { user: UserState }) => state.user.refreshToken

export default userSlice.reducer
