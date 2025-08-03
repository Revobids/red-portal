import { reduxAuthSliceInitialStates } from '@/data/redux-state';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@/types';

interface IAuthState {
  user: Employee;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: IAuthState = {
  user: reduxAuthSliceInitialStates.USER_INITIAL_STATE,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<Employee>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = reduxAuthSliceInitialStates.USER_INITIAL_STATE;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice;