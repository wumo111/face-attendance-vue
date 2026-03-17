import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      ElMessage.error(res.msg || 'Error');
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res.data;
  },
  (error) => {
    ElMessage.error(error.message || 'Request Error');
    return Promise.reject(error);
  }
);

export default {
  register(data) {
    return api.post('/user/register', data);
  },
  login(data) {
    return api.post('/login', data);
  },
  getEmployeeList() {
    return api.get('/employee/list');
  },
  addEmployee(formData) {
    return api.post('/employee/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteEmployee(id) {
    return api.delete(`/employee/${id}`);
  },
  getAttendanceList(params) {
    const { page, pageSize, ...rest } = params;
    return api.get('/attendance/list', { 
      params: { 
        page, 
        size: pageSize, 
        ...rest 
      } 
    });
  },
  getCaptureList(params) {
    const { page, pageSize, ...rest } = params;
    return api.get('/capture/list', { 
      params: { 
        page, 
        size: pageSize, 
        ...rest 
      } 
    });
  },
  getStatistics() {
    return Promise.resolve({
      stats: { total: 0, actual: 0, absent: 0, late: 0 },
      lastCapture: null
    }); 
  }
};
