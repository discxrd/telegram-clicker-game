import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clientAxios } from "../utils/axiosInstance";

export const fetchUserInfo = createAsyncThunk(
  "/user/fetchUserInfo",
  async (id, { rejectWithValue }) => {
    try {
      const response = await clientAxios.post("/get_info", {
        telegram_id: id,
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {
    updateUserField: (state, action) => {
      const { field, value } = action.payload;
      if (state.data) {
        state.data.info[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { updateUserField } = userSlice.actions;
export default userSlice.reducer;
