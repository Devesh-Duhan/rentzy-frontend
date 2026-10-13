import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';

export const makeStore = () => configureStore({ reducer: { auth: authReducer, property: propertyReducer } });
