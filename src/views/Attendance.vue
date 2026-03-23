<template>
  <div class="attendance-container">
    <div class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="filters.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchAttendance">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="chart-card">
      <div id="attendanceChart" style="width: 100%; height: 400px;"></div>
    </div>

    <div class="table-card">
      <el-table :data="tableData" style="width: 100%" stripe border>
        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="employeeId" label="学号" width="180" />
        <el-table-column prop="recordTime" label="打卡时间" />
        <el-table-column prop="statusText" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.statusText === '正常' ? 'success' : scope.row.statusText === '迟到' ? 'warning' : 'danger'"
            >
              {{ scope.row.statusText }}
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
      <div class="export-btn">
        <el-button type="success" @click="exportExcel">导出 Excel</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import * as echarts from 'echarts';
import api from '../api';

const filters = reactive({
  date: [],
  name: '',
});

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
let chartInstance = null;

const mapStatusText = (status) => {
  if (status === 0 || status === '0') return '正常';
  if (status === 1 || status === '1') return '迟到';
  if (status === 2 || status === '2') return '早退';
  return status || '未知';
};

const normalizeAttendance = (item) => ({
  ...item,
  name: item.employeeName || item.name || '未知',
  employeeId: item.employeeId || item.id || '-',
  recordTime: item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.recordTime || '-'),
  statusText: mapStatusText(item.status),
});

const fetchAttendance = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      startDate: filters.date ? filters.date[0] : null,
      endDate: filters.date ? filters.date[1] : null,
      name: filters.name,
    };
    const res = await api.getAttendanceList(params);
    // res: { list: [...], total: N }
    if (res && res.list) {
      tableData.value = res.list.map(normalizeAttendance);
      total.value = res.total || res.list.length;
    } else if (Array.isArray(res)) {
      tableData.value = res.map(normalizeAttendance);
      total.value = res.length;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchAttendance();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchAttendance();
};

const exportExcel = () => {
  const headers = ['姓名', '学号', '打卡时间', '状态'];
  const rows = tableData.value.map((item) => [item.name, item.employeeId, item.recordTime, item.statusText]);
  const csv = [headers, ...rows].map((line) => line.map((v) => `"${String(v ?? '')}"`).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `attendance_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const initChart = () => {
  const chartDom = document.getElementById('attendanceChart');
  chartInstance = echarts.init(chartDom);
  const option = {
    title: {
      text: '近7天出勤率趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} %',
      },
    },
    series: [
      {
        data: [82, 93, 90, 93, 100, 100, 100], // Mock data
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#1e3a8a',
        },
      },
    ],
  };
  chartInstance.setOption(option);
};

const updateChart = (data) => {
  if (data && chartInstance) {
    chartInstance.setOption({
      xAxis: {
        data: data.dates,
      },
      series: [
        {
          data: data.rates,
        },
      ],
    });
  }
};

onMounted(() => {
  fetchAttendance();
  initChart();
  window.addEventListener('resize', () => {
    chartInstance && chartInstance.resize();
  });
});
</script>

<style scoped>
.attendance-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card, .chart-card, .table-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.export-btn {
  margin-top: 20px;
  text-align: right;
}
</style>
