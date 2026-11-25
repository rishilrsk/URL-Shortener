import axios from "axios";

// One shared client for the backend. The long timeout covers the free-tier
// cold start on Render, which can take up to a minute.
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL?.trim(),
  timeout: 75000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Turns any request error into a message we can show the user.
export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.code === "ECONNABORTED") {
    return "The server took too long to respond. It may be starting up, so please try again in a minute.";
  }
  if (!err.response) {
    return "Can't reach the server right now. Please check your connection and try again.";
  }
  return fallback;
};

// Remembers the email between the signup/forgot-password page and the code
// page, so a page refresh doesn't lose it.
export const rememberEmail = (email) => sessionStorage.setItem("pendingEmail", email);
export const recallEmail = () => sessionStorage.getItem("pendingEmail") || "";

export default api;
