import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "http://127.0.0.1:8000/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		console.log("Token :", token);

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response.status === 401) {
			console.warn("Unauthorized! Redirecting to login...");

			if (typeof window !== "undefined") {
				window.location.href = "/";
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;