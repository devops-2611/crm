import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const axiosInstance: AxiosInstance = axios.create({
  //baseURL: 'http://localhost:5000',
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("appToken");

    // Cast config to InternalAxiosRequestConfig to ensure compatibility
    const internalConfig = config as InternalAxiosRequestConfig;

    if (token) {
      internalConfig.headers = internalConfig.headers || {}; // Ensure headers is not undefined
      internalConfig.headers["Authorization"] = `Bearer ${token}`;
    }

    return internalConfig;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("appToken");
    }
    return Promise.reject(error);
  },
);

const ApiHelpers = {
  GET: (url: string, config: AxiosRequestConfig = {}) =>
    axiosInstance.get(url, config),
  POST: (
    url: string,
    data: FormData | JSON,
    config: AxiosRequestConfig = {},
  ) => {
    if (data instanceof FormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      };
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }
    return axiosInstance.post(url, data, config);
  },
  PUT: (url: string, data: any, config: AxiosRequestConfig = {}) =>
    axiosInstance.put(url, data, config),
  DELETE: (url: string, config: AxiosRequestConfig = {}) =>
    axiosInstance.delete(url, config),
  PATCH: (url: string, data: any, config: AxiosRequestConfig = {}) =>
    axiosInstance.patch(url, data, config),
};

export default ApiHelpers;
