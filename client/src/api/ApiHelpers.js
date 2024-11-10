
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('appToken'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('appToken');
    }
    return Promise.reject(error);
  }
);

const ApiHelpers = {
  GET: (url, config = {}) => axiosInstance.get(url, config),
  POST: (url, data, config = {}) => {
    if (data instanceof FormData) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      };
    } else {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
    }
    return axiosInstance.post(url, data, config);
  },
  PUT: (url, data, config = {}) => axiosInstance.put(url, data, config),
  DELETE: (url, config = {}) => axiosInstance.delete(url, config),
  PATCH: (url, data, config = {}) => axiosInstance.patch(url, data, config),
};

export default ApiHelpers;
