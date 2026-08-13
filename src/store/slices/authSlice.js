import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

// Get user from localStorage safely in Next.js
const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const initialState = {
  user: getUserFromStorage(),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const data = { ...userData, email: userData.email.toLowerCase() };
      const response = await axios.post('/auth/register', data);
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Send registration OTP
export const sendRegisterOtp = createAsyncThunk(
  'auth/sendRegisterOtp',
  async (userData, thunkAPI) => {
    try {
      const data = { ...userData, email: userData.email.toLowerCase() };
      const response = await axios.post('/auth/register-otp', data);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Resend registration OTP
export const resendRegisterOtp = createAsyncThunk(
  'auth/resendRegisterOtp',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post('/auth/resend-register-otp', { email: email.toLowerCase() });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify registration OTP
export const verifyRegisterOtp = createAsyncThunk(
  'auth/verifyRegisterOtp',
  async (otpData, thunkAPI) => {
    try {
      const data = { ...otpData, email: otpData.email.toLowerCase() };
      const response = await axios.post('/auth/verify-register-otp', data);
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const data = { ...userData, email: userData.email.toLowerCase() };
    const response = await axios.post('/auth/login', data);
    if (response.data && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Send Forgot Password OTP
export const sendForgotPasswordOtp = createAsyncThunk(
  'auth/sendForgotPasswordOtp',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post('/auth/forgot-password-otp', { email: email.toLowerCase() });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.post('/auth/logout');
  } catch (error) {
    console.error("Logout API failed", error);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear all cookies
    try {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    } catch (cookieError) {
      console.error("Failed to clear cookies", cookieError);
    }
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const config = {
        headers: {
          'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      };
      const response = await axios.put('/users/profile', userData, config);
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const becomeSeller = createAsyncThunk(
  'auth/becomeSeller',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('/users/become-seller', userData);
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Google Login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('/auth/google', {
        name: userData.name,
        email: userData.email.toLowerCase(),
        uid: userData.uid,
        picture: userData.picture,
      });
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset password after OTP verification
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, password, otp }, thunkAPI) => {
    try {
      const response = await axios.post('/auth/reset-password', { email: email.toLowerCase(), password, otp });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null;
      })
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null;
      })
      .addCase(sendForgotPasswordOtp.pending, (state) => { state.isLoading = true; })
      .addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true;
        state.message = action.payload.message || 'OTP sent successfully';
      })
      .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(sendRegisterOtp.pending, (state) => { state.isLoading = true; })
      .addCase(sendRegisterOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true;
        state.message = action.payload.message || 'Verification code sent to your email';
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(resendRegisterOtp.pending, (state) => { state.isLoading = true; })
      .addCase(resendRegisterOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true;
        state.message = action.payload.message || 'A new verification code has been sent';
      })
      .addCase(resendRegisterOtp.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(verifyRegisterOtp.pending, (state) => { state.isLoading = true; })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null;
      })
      .addCase(logout.fulfilled, (state) => { state.user = null; })
      .addCase(updateProfile.pending, (state) => { state.isLoading = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(becomeSeller.pending, (state) => { state.isLoading = true; })
      .addCase(becomeSeller.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(becomeSeller.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(googleLogin.pending, (state) => { state.isLoading = true; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true; state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => { state.isLoading = true; })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false; state.isSuccess = true;
        state.message = action.payload.message || 'Password reset successful';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false; state.isError = true; state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
