import axios from "axios";

// Access the NEXT_PUBLIC_API_URL defined in the environment variables, 
// defaulting to localhost:5000/api if missing.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: Add request interceptor to inject JWT tokens
axiosInstance.interceptors.request.use(
    (config) => {
        // Check if we are running in the browser
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token"); // Assuming JWT is stored in localStorage
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add response interceptor handles global errors (like 401 Unauthorized)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== "undefined") {
                // Redirect to login if unauthorized, handle properly in your app flow
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
