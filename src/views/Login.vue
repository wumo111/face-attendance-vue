<template>
  <div class="login-container">
    <div class="login-card">
      <h2>课堂考勤系统登录</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="loading">登录</el-button>
          <el-button link type="primary" @click="goRegister">去注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: false,
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const onSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await api.login({
          username: form.username,
          password: form.password,
        });
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', form.username);
        if (form.rememberMe) {
          localStorage.setItem('rememberMe', JSON.stringify(form));
        } else {
          localStorage.removeItem('rememberMe');
        }
        ElMessage.success('登录成功');
        router.push('/dashboard');
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const init = () => {
  const remembered = localStorage.getItem('rememberMe');
  if (remembered) {
    const data = JSON.parse(remembered);
    form.username = data.username;
    form.password = data.password;
    form.rememberMe = true;
  }
};

const goRegister = () => {
  router.push('/register');
};

init();
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-card h2 {
  margin-bottom: 30px;
  color: #1e3a8a;
}
</style>
