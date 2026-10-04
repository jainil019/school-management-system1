import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For PDF/file uploads using FormData,
    // remove application/json so the browser
    // automatically sets multipart/form-data
    // with the required boundary.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;