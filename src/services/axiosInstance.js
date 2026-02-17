// import axios from "axios";

// const axiosInstance = axios.create({
// 	baseURL: "http://127.0.0.1:8000/api",
// 	timeout: 10000,
// 	headers: {
// 		"Content-Type": "application/json",
// 	},
// });

// axiosInstance.interceptors.request.use(
// 	(config) => {
// 	  const token = localStorage.getItem("access"); // ✅ correct key
// 	  console.log("Access Token:", token);
  
// 	  if (token) {
// 		config.headers.Authorization = `Bearer ${token}`;
// 	  }
// 	  return config;
// 	},
// 	(error) => Promise.reject(error)
//   );
  

// axiosInstance.interceptors.response.use(
// 	(response) => response,
// 	(error) => {
// 		if (error.response.status === 401) {
// 			console.warn("Unauthorized! Redirecting to login...");

// 			if (typeof window !== "undefined") {
// 				window.location.href = "/";
// 			}
// 		}
// 		return Promise.reject(error);
// 	}
// );

// export default axiosInstance;



import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Include access token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized with token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem("refresh");
      
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
          
        } catch (refreshError) {
          console.warn("Token refresh failed. Redirecting to login...");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        console.warn("No refresh token available. Redirecting to login...");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
