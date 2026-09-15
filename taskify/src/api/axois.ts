import axios from "axios";

type RequestConfig = {
  headers: {
    set: (name: string, value: string) => void;
  };
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  
  withCredentials: true, 
  
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use(
  (config: RequestConfig) => {
    let token = localStorage.getItem("token");

    if (!token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          token = userObj.token || userObj.accessToken || null;
        } catch {
          localStorage.removeItem("user");
        }
      }
    }

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;