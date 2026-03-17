<template>
  <div class="employee-container">
    <div class="header">
      <el-button type="primary" @click="handleAdd">新增人员</el-button>
    </div>
    <el-table :data="tableData" style="width: 100%" stripe border>
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="gender" label="性别" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.gender === 1 ? 'primary' : 'danger'">
            {{ scope.row.gender === 1 ? '男' : '女' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="idCard" label="身份证号" width="200" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column prop="address" label="地址" width="200" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑人员' : '新增人员'" width="30%">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="照片" prop="photo">
          <el-upload
            class="upload-demo"
            action="/api/employee/add"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';

const tableData = ref([]);
const dialogVisible = ref(false);
const formRef = ref(null);

const form = reactive({
  id: '',
  name: '',
  gender: 1,
  idCard: '',
  address: '',
  phone: '',
  photo: null,
});

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
};

const fetchEmployees = async () => {
  try {
    const res = await api.getEmployeeList();
    // 文档显示返回的是 data: [...]，没有分页信息
    if (Array.isArray(res)) {
      tableData.value = res;
    } else if (res && res.list) {
      // 兼容可能的分页结构
      tableData.value = res.list;
    }
  } catch (error) {
    console.error(error);
  }
};

const handleAdd = () => {
  form.id = '';
  form.name = '';
  form.gender = 1;
  form.idCard = '';
  form.address = '';
  form.phone = '';
  form.photo = null;
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  form.id = row.id;
  form.name = row.name;
  form.gender = row.gender;
  form.idCard = row.idCard;
  form.address = row.address || '';
  form.phone = row.phone;
  // Note: Photo upload for edit might need special handling
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该人员吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await api.deleteEmployee(row.id);
        ElMessage.success('删除成功');
        fetchEmployees();
      } catch (error) {
        console.error(error);
      }
    })
    .catch(() => {});
};

const beforeUpload = (file) => {
  form.photo = file;
  return false; // Prevent automatic upload
};

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.id) {
          ElMessage.warning('当前后端文档未提供编辑接口，请删除后重新新增');
          return;
        }
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('gender', form.gender);
        formData.append('idCard', form.idCard);
        formData.append('address', form.address);
        formData.append('phone', form.phone);
        if (form.photo) {
          formData.append('photo', form.photo);
        }
        
        await api.addEmployee(formData);
        ElMessage.success(form.id ? '编辑成功' : '新增成功');
        dialogVisible.value = false;
        fetchEmployees();
      } catch (error) {
        console.error(error);
      }
    }
  });
};

onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
.employee-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 20px;
  text-align: right;
}
</style>
