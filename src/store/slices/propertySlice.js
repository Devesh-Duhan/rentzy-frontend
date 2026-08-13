import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

const initialState = {
  properties: [],
  property: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  pagination: {},
  sellerProperties: [],
  sellerStats: null,
};

// Fetch all properties
export const getProperties = createAsyncThunk(
  'properties/getAll',
  async (queryParams = '', thunkAPI) => {
    try {
      const response = await axios.get(`/properties${queryParams}`);
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

// Create a new property
export const createProperty = createAsyncThunk(
  'properties/create',
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
export const getProperty = createAsyncThunk(
  'properties/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`/properties/${id}`);
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

export const getSellerProperties = createAsyncThunk(
  'properties/getSeller',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/properties/my');
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

export const getSellerStats = createAsyncThunk(
  'properties/getStats',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/properties/seller-stats');
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
export const getAllPropertiesAdmin = createAsyncThunk(
  'properties/getAllAdmin',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/properties/admin/all');
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
export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProperties.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.properties = action.payload.properties;
        state.pagination = { pages: action.payload.pages, page: action.payload.page, count: action.payload.count };
      })
      .addCase(getProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProperty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.property = action.payload;
      })
      .addCase(getProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.properties = [action.payload, ...state.properties];
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSellerProperties.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSellerProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.sellerProperties = action.payload;
      })
      .addCase(getSellerProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSellerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSellerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.sellerStats = action.payload;
      })
      .addCase(getSellerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllPropertiesAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllPropertiesAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.properties = action.payload;
      })
      .addCase(getAllPropertiesAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = propertySlice.actions;
export default propertySlice.reducer;
