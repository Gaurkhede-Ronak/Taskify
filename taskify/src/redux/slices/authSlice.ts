import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axois";

interface AuthState {
  user: null | { name: string; email: string; [key: string]: any }; 
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");
let parsedUser: AuthState["user"] = null;

export const getTokenExpiration = (token: string | null): number | null => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return 0;
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof decodedPayload.exp === "number" ? decodedPayload.exp * 1000 : null;
  } catch {
    return 0;
  }
};

try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch {
  localStorage.removeItem("user");
}

const initialState: AuthState = {
  user: parsedUser,
  isAuthenticated: (() => {
    const token = storedToken || parsedUser?.token || parsedUser?.accessToken;
    const expiration = getTokenExpiration(token || null);
    return Boolean(token && expiration !== 0 && (!expiration || expiration > Date.now()));
  })(),
  loading: false,
  error: null,
};

// Login API Call
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Register API Call
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // ================= LOGIN CASES =================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        

        const userData = action.payload.data || action.payload.user || action.payload;
        const accessToken = userData.accessToken || userData.token;
        const persistedUser = { ...userData, token: accessToken };
        state.user = persistedUser;
        localStorage.setItem("user", JSON.stringify(persistedUser));
        localStorage.setItem("token", accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ================= REGISTER CASES =================
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        const userData = action.payload.data || action.payload.user || action.payload;
        const accessToken = userData.accessToken || userData.token;
        const persistedUser = { ...userData, token: accessToken };
        state.user = persistedUser;
        localStorage.setItem("user", JSON.stringify(persistedUser));
        localStorage.setItem("token", accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;