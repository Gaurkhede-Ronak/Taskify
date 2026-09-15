import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTasksAPI, addTaskAPI, updateTaskAPI, deleteTaskAPI } from "../../api/taskApi";

export interface Task {
  _id: string;
  taskName: string;
  description?: string;
  project: string;
  assignedTo?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getApiError = (error: any, fallback: string) => {
  const response = error.response?.data;
  const validationError = response?.errors?.[0]?.message;
  return validationError || response?.message || fallback;
};

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

export const getTasks = createAsyncThunk("tasks/getTasks", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchTasksAPI();
    return data;
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to fetch tasks"));
  }
});

export const createNewTask = createAsyncThunk("tasks/createNewTask", async (taskData: Partial<Task>, { rejectWithValue }) => {
  try {
    const data = await addTaskAPI(taskData);
    return data;
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to create task"));
  }
});

export const updateExistingTask = createAsyncThunk(
  "tasks/updateExistingTask",
  async ({ taskId, taskData }: { taskId: string; taskData: Partial<Task> }, { rejectWithValue }) => {
    try {
      const data = await updateTaskAPI(taskId, taskData);
      return data;
    } catch (error: any) {
      return rejectWithValue(getApiError(error, "Failed to update task"));
    }
  }
);

export const removeTask = createAsyncThunk("tasks/removeTask", async (taskId: string, { rejectWithValue }) => {
  try {
    await deleteTaskAPI(taskId);
    return { taskId };
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to delete task"));
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        const newTask = action.payload?.data?.task;
        if (newTask) {
          state.tasks.unshift(newTask);
        }
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExistingTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload?.data?.task;
        if (updatedTask) {
          state.tasks = state.tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task));
        }
      })
      .addCase(updateExistingTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload.taskId);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default taskSlice.reducer;