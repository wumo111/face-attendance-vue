<template>
  <div class="dashboard-container">
    <div class="video-card">
      <div class="video-header">
        <h3>实时监控画面</h3>
        <el-tag type="success">实时</el-tag>
      </div>
      <div class="video-content">
        <div v-if="videoError" class="video-placeholder">
          <el-icon size="64"><VideoCamera /></el-icon>
          <p>无法访问摄像头</p>
          <p style="font-size: 12px; color: #999;">{{ videoErrorMsg }}</p>
          <el-button type="primary" size="small" @click="startCamera" style="margin-top: 10px;">
            重试
          </el-button>
        </div>
        <video v-else ref="videoRef" autoplay playsinline muted width="640" height="480"></video>
      </div>
    </div>
    <div class="info-card">
      <div class="info-header">
        <h3>最新识别结果</h3>
      </div>
      <div class="info-content" v-if="lastCapture">
        <el-image :src="lastCapture.imageUrl" fit="cover" class="capture-image" />
        <div class="capture-details">
          <p><strong>姓名：</strong>{{ lastCapture.name }}</p>
          <p><strong>学号：</strong>{{ lastCapture.employeeId }}</p>
          <p><strong>时间：</strong>{{ lastCapture.captureTime }}</p>
          <el-tag :type="lastCapture.status === '正常' ? 'success' : 'danger'">
            {{ lastCapture.status }}
          </el-tag>
        </div>
      </div>
      <div class="info-content" v-else>
        <p>暂无识别记录</p>
      </div>
    </div>
    <div class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="应到人数" :value="stats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="实到人数" :value="stats.actual" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="缺勤人数" :value="stats.absent" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="迟到人数" :value="stats.late" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { VideoCamera } from '@element-plus/icons-vue';
import api from '../api';

const videoRef = ref(null);
const videoError = ref(false);
const videoErrorMsg = ref('');
let mediaStream = null;

const startCamera = async () => {
  try {
    videoError.value = false;
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false
    });
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }
  } catch (err) {
    console.error('摄像头访问失败:', err);
    videoError.value = true;
    if (err.name === 'NotAllowedError') {
      videoErrorMsg.value = '请允许浏览器访问摄像头权限';
    } else if (err.name === 'NotFoundError') {
      videoErrorMsg.value = '未检测到摄像头设备';
    } else {
      videoErrorMsg.value = '摄像头访问失败，请检查设备';
    }
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
};
const lastCapture = ref(null);
const stats = ref({
  total: 0,
  actual: 0,
  absent: 0,
  late: 0,
});
let timer = null;

const fetchDashboardData = async () => {
  try {
    const [statsData, captureRes] = await Promise.all([
      api.getStatistics(),
      api.getCaptureList({ page: 1, pageSize: 1 }),
    ]);
    // statsData: { total, actual, absent, late }
    stats.value = statsData || { total: 0, actual: 0, absent: 0, late: 0 };

    // captureRes: { list: [...], total: N }
    const captureList = captureRes?.list || captureRes || [];

    const latest = captureList[0];
    const imageUrl = `/uploads/${latest.imageUrl}`;
    lastCapture.value = latest
      ? {
          imageUrl: imageUrl ,
          name: latest.employeeName || '未知',
          employeeId: latest.employeeId || '-',
          captureTime: latest.timestamp ? new Date(latest.timestamp).toLocaleString() : '-',
          status: Number(latest.score || 0) >= 0.6 ? '正常' : '迟到',
        }
      : null;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  startCamera();
  fetchDashboardData();
  timer = setInterval(fetchDashboardData, 3000); // Poll every 3 seconds
});

onUnmounted(() => {
  stopCamera();
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.dashboard-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
}

.video-card {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-card {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-card {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.video-header, .info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.video-content {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  min-height: 480px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  gap: 10px;
}

.capture-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.capture-details p {
  margin: 10px 0;
  color: #666;
}
</style>
