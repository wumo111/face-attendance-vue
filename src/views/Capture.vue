<template>
  <div class="capture-container">
    <div class="header">
      <el-button type="primary" @click="fetchCaptures">刷新</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" stripe border>
      <el-table-column prop="imageUrl" label="抓拍照片" width="180">
        <template #default="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.imageUrl"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="180">
        <template #default="scope">
          {{ scope.row.name || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="captureTime" label="抓拍时间" />
      <el-table-column prop="score" label="识别分数" width="100">
        <template #default="scope">
          <el-tag
            :type="scope.row.score >= 0.8 ? 'success' : scope.row.score >= 0.6 ? 'warning' : 'danger'"
          >
            {{ Number(scope.row.score || 0).toFixed(2) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const normalizeCapture = (item) => ({
  ...item,
  imageUrl: item.imageUrl || item.image || '',
  name: item.name || item.employeeName || '未知',
  captureTime: item.captureTime || item.createTime || item.time || '-',
  score: Number(item.score || 0),
});

const fetchCaptures = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const res = await api.getCaptureList(params);
    if (res.list) {
      tableData.value = res.list.map(normalizeCapture);
      total.value = res.total;
    } else if (Array.isArray(res)) {
      tableData.value = res.map(normalizeCapture);
      total.value = res.length;
    } else if (res.data && Array.isArray(res.data)) {
      tableData.value = res.data.map(normalizeCapture);
      total.value = res.total || res.data.length;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchCaptures();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchCaptures();
};

onMounted(() => {
  fetchCaptures();
});
</script>

<style scoped>
.capture-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 20px;
  text-align: right;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
