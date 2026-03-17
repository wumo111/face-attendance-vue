import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../layout/Layout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('../views/Attendance.vue'),
        meta: { title: '考勤记录' },
      },
      {
        path: 'employee',
        name: 'Employee',
        component: () => import('../views/Employee.vue'),
        meta: { title: '人员管理' },
      },
      {
        path: 'capture',
        name: 'Capture',
        component: () => import('../views/Capture.vue'),
        meta: { title: '抓拍记录' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (!['/login', '/register'].includes(to.path) && !token) {
    return '/login';
  }
  return true;
});

export default router;
