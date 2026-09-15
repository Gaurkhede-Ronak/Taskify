import axiosInstance from "./axois";

export const fetchTasksAPI = async () => {
  const response = await axiosInstance.get("/tasks/my-tasks");
  return response.data;
};

export const fetchTasksByProjectAPI = async (projectId: string) => {
  const response = await axiosInstance.get(`/tasks/project-tasks/${projectId}`);
  return response.data;
};

export const addTaskAPI = async (taskData: any) => {
  const response = await axiosInstance.post("/tasks/addTask", taskData);
  return response.data;
};

export const updateTaskAPI = async (taskId: string, taskData: any) => {
  const response = await axiosInstance.post("/tasks/updateTask", {
    ...taskData,
    taskId,
  });
  return response.data;
};

export const deleteTaskAPI = async (taskId: string) => {
  const response = await axiosInstance.post(`/tasks/deleteTask/${taskId}`);
  return response.data;
};