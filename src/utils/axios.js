import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/${
    import.meta.env.VITE_API_VERSION
  }`,
  headers: {
    apiKey: import.meta.env.VITE_API_KEY,
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const token = localStorage.getItem("token");

    if (apiKey) {
      config.headers["apiKey"] = apiKey;
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
