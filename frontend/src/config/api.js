import axios from "axios";

/**
 * Centralized Axios instance. All API calls in the app should import this
 * rather than calling axios directly — makes it trivial to change the base
 * URL, add interceptors (auth refresh, global error toast), etc. in one place.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // sends the httpOnly JWT cookie set by the backend
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized place to handle 401 (redirect to admin login), 500 (toast), etc.
    return Promise.reject(error);
  }
);

export default api;
