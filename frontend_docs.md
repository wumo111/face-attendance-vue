# 课堂考勤系统前端开发文档

## 1. 项目概述

本项目是课堂考勤系统的前端部分，基于 Vue 3 + Element Plus 开发。

### 技术栈

- **Vue 3**: 使用 Composition API 进行组件逻辑复用。
- **Element Plus**: UI 组件库。
- **Axios**: HTTP 请求库，封装了请求和响应拦截器。
- **Vue Router**: 路由管理，实现了路由守卫。
- **Echarts**: 数据可视化，用于展示出勤率趋势。

## 2. 目录结构

```
src/
├── api/            # API 接口封装
│   └── index.js    # 统一导出 API 方法
├── assets/         # 静态资源
├── components/     # 公共组件
├── layout/         # 布局组件
│   └── Layout.vue  # 包含侧边栏、顶部导航和主内容区
├── router/         # 路由配置
│   └── index.js    # 路由定义及导航守卫
├── views/          # 页面组件
│   ├── Login.vue       # 登录页
│   ├── Dashboard.vue   # 首页（实时监控与统计）
│   ├── Attendance.vue  # 考勤记录
│   ├── Employee.vue    # 人员管理
│   ├── Capture.vue     # 抓拍记录
│   └── Settings.vue    # 系统设置
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 3. 功能模块

### 3.1 登录 (Login)

- **路径**: `/login`
- **功能**: 用户名密码登录，支持“记住密码”功能。
- **逻辑**: 登录成功后将 token 和用户信息存入 localStorage，并跳转至首页。

### 3.2 布局 (Layout)

- **组件**: `Layout.vue`
- **功能**: 
  - 顶部：显示系统时间（每秒更新）、当前登录用户、退出登录功能。
  - 左侧：导航菜单，对应各个功能模块。
  - 内容区：使用 `<router-view>` 渲染子路由页面。

### 3.3 首页 (Dashboard)

- **路径**: `/dashboard`
- **功能**:
  - **实时监控**: 显示 Python 后端提供的实时视频流（需后端支持）。
  - **最新识别**: 显示最近一次识别到的人员信息。
  - **今日统计**: 展示应到、实到、缺勤、迟到人数统计。

### 3.4 考勤记录 (Attendance)

- **路径**: `/attendance`
- **功能**:
  - **查询**: 支持按日期范围、姓名筛选考勤记录。
  - **列表**: 展示详细考勤数据，状态以不同颜色标签区分。
  - **图表**: 使用 Echarts 展示近7天出勤率趋势。
  - **导出**: 提供导出 Excel 功能。

### 3.5 人员管理 (Employee)

- **路径**: `/employee`
- **功能**:
  - **列表**: 展示人员基本信息。
  - **新增/编辑**: 弹窗形式，支持照片上传。
  - **删除**: 确认后删除人员信息。

### 3.6 抓拍记录 (Capture)

- **路径**: `/capture`
- **功能**: 展示系统自动抓拍的人脸照片及识别分数，支持分页浏览。

## 4. 接口封装

所有接口定义在 `src/api/index.js` 中，主要方法包括：

- `login(data)`: 用户登录
- `getEmployeeList(params)`: 获取人员列表
- `addEmployee(formData)`: 新增/编辑人员（含文件上传）
- `deleteEmployee(id)`: 删除人员
- `getAttendanceList(params)`: 获取考勤列表
- `getCaptureList(params)`: 获取抓拍列表
- `getStatistics()`: 获取首页统计数据

## 5. 开发与部署

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产环境

```bash
npm run build
```

## 6. 注意事项

- **视频流**: 首页视频播放依赖后端提供的 MJPEG 流或静态文件服务，请确保后端接口 `/api/video_feed` 可用。
- **跨域**: 开发环境中需在 `vite.config.js` 中配置代理，解决前后端跨域问题。
- **样式**: 主色调采用 `#1e3a8a`，背景色 `#f3f4f6`，适配 1366x768 以上分辨率。
