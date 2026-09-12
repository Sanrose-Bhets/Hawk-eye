import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/lib/types';

interface UserState {
  user: User | null;
  refreshToken: string | null;
}

const initialState: UserState = {
  user: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        refreshToken?: string;
      }>,
    ) => {
      state.user = action.payload.user;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, clearCredentials } = userSlice.actions;

export const selectCurrentUser = (state: { user: UserState }) =>
  state.user.user;
export const selectRefreshToken = (state: { user: UserState }) =>
  state.user.refreshToken;

export default userSlice.reducer;
