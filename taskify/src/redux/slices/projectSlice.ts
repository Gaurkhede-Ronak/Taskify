import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axois";

export interface Project {
  _id: string; 
  projectName: string;
  description: string;
  priority: string;
  status: string;
  members: string[];
  dueDate: string;
  owner?: string;
  progress?: number;
  tasksCount?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const getApiError = (error: any, fallback: string) => {
  const response = error.response?.data;
  const validationError = response?.errors?.[0]?.message;
  return validationError || response?.message || fallback;
};

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// 1. FETCH -> GET /api/projects/my-projects
export const fetchProjects = createAsyncThunk("projects/fetchProjects", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/projects/my-projects");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to fetch projects"));
  }
});
export const getProjects = fetchProjects;

// 2. CREATE -> POST /api/projects/addProject
export const createProject = createAsyncThunk("projects/createProject", async (projectData: Partial<Project>, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/projects/addProject", projectData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to create project"));
  }
});

// 3. UPDATE -> POST /api/projects/updateProject
export const updateProject = createAsyncThunk(
  "projects/updateProject", 
  async (projectData: Partial<Project> & { _id: string; owner?: string }, { rejectWithValue }) => {
    try {
      const payload = {
        projectId: projectData._id,
        projectName: projectData.projectName,
        description: projectData.description,
        priority: projectData.priority,
        status: projectData.status,
        members: projectData.members,
        dueDate: projectData.dueDate,
        owner: projectData.owner,
      };
      const response = await axiosInstance.post("/projects/updateProject", payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getApiError(error, "Failed to update project"));
    }
  }
);

// 4. DELETE -> POST /api/projects/delete-Project/:id
export const deleteProject = createAsyncThunk("projects/deleteProject", async (projectId: string, { rejectWithValue }) => {
  try {
    await axiosInstance.post(`/projects/delete-Project/${projectId}`);
    return projectId;
  } catch (error: any) {
    return rejectWithValue(getApiError(error, "Failed to delete project"));
  }
});

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(createProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        const newProject = action.payload?.data?.project;
        if (newProject) {
          state.projects.unshift({ ...newProject, progress: 0, tasksCount: "0/0" });
        }
      })
      .addCase(createProject.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(updateProject.fulfilled, (state, action) => {
        const updatedProject = action.payload?.data?.project;
        if (updatedProject) {
          const index = state.projects.findIndex((p) => p._id === updatedProject._id);
          if (index !== -1) {
            state.projects[index] = { ...state.projects[index], ...updatedProject };
          }
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
      });
  },
});

export default projectSlice.reducer;