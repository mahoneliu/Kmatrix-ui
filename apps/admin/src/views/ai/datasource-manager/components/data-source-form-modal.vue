<script setup lang="ts">
/**
 * 数据源表单对话框
 * @author Mahone
 * @date 2026-01-20
 */
import { reactive, ref, watch } from 'vue';
import {
  type FormInst,
  type FormRules,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSwitch,
  useMessage
} from 'naive-ui';
import { addDataSource, fetchDynamicDataSourceKeys, updateDataSource } from '@/service/api/ai/datasource';

interface Props {
  show: boolean;
  dataSource?: any;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const message = useMessage();

const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const dynamicDsOptions = ref<Array<{ label: string; value: string }>>([]);

// 表单数据
const formModel = reactive({
  dataSourceId: null as number | null,
  dataSourceName: '',
  sourceType: 'MANUAL' as 'DYNAMIC' | 'MANUAL',
  dsKey: '',
  driverClassName: 'com.mysql.cj.jdbc.Driver',
  jdbcUrl: '',
  username: '',
  password: '',
  dbType: 'mysql',
  isEnabled: '1'
});

// 表单验证规则
const rules: FormRules = {
  dataSourceName: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  dsKey: [
    {
      validator: (_rule, value) => {
        if (formModel.sourceType === 'DYNAMIC' && !value) {
          return new Error('请选择动态数据源');
        }
        return true;
      },
      trigger: 'change'
    }
  ],
  driverClassName: [
    {
      validator: (_rule, value) => {
        if (formModel.sourceType === 'MANUAL' && !value) {
          return new Error('请输入驱动类名');
        }
        return true;
      },
      trigger: 'blur'
    }
  ],
  jdbcUrl: [
    {
      validator: (_rule, value) => {
        if (formModel.sourceType === 'MANUAL' && !value) {
          return new Error('请输入 JDBC URL');
        }
        return true;
      },
      trigger: 'blur'
    }
  ],
  username: [
    {
      validator: (_rule, value) => {
        if (formModel.sourceType === 'MANUAL' && !value) {
          return new Error('请输入用户名');
        }
        return true;
      },
      trigger: 'blur'
    }
  ]
};

// 监听对话框显示状态
watch(
  () => props.show,
  async newVal => {
    if (newVal) {
      // 加载动态数据源列表
      await loadDynamicDataSources();

      // 如果是编辑模式，填充表单
      if (props.dataSource) {
        Object.assign(formModel, props.dataSource);
      } else {
        resetForm();
      }
    }
  }
);

// 加载动态数据源列表
async function loadDynamicDataSources() {
  try {
    const result = await fetchDynamicDataSourceKeys();
    let data: any;
    if (result && typeof result === 'object' && 'data' in result) {
      data = (result as any).data;
    } else {
      data = result;
    }
    dynamicDsOptions.value = (data || []).map((key: string) => ({
      label: key,
      value: key
    }));
  } catch {
    // 忽略错误
  }
}

// 重置表单
function resetForm() {
  formModel.dataSourceId = null;
  formModel.dataSourceName = '';
  formModel.sourceType = 'MANUAL';
  formModel.dsKey = '';
  formModel.driverClassName = 'com.mysql.cj.jdbc.Driver';
  formModel.jdbcUrl = '';
  formModel.username = '';
  formModel.password = '';
  formModel.dbType = 'mysql';
  formModel.isEnabled = '1';
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    if (formModel.dataSourceId) {
      const { error } = await updateDataSource(formModel);
      if (!error) message.success('编辑成功');
    } else {
      const { error } = await addDataSource(formModel);
      if (!error) message.success('新增成功');
    }
    emit('success');
  } catch (error: any) {
    if (error.message) {
      message.error(`操作失败: ${error.message}`);
    }
  } finally {
    loading.value = false;
  }
}

// 关闭对话框
function handleClose() {
  emit('update:show', false);
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="dataSource ? '编辑数据源' : '新增数据源'"
    class="w-180"
    @update:show="handleClose"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="120">
      <NFormItem label="数据源名称" path="dataSourceName">
        <NInput v-model:value="formModel.dataSourceName" placeholder="请输入数据源名称" />
      </NFormItem>

      <NFormItem label="数据源类型" path="sourceType">
        <NRadioGroup v-model:value="formModel.sourceType">
          <NRadioButton value="MANUAL">手工配置</NRadioButton>
          <NRadioButton value="DYNAMIC">动态数据源</NRadioButton>
        </NRadioGroup>
      </NFormItem>

      <!-- DYNAMIC 类型配置 -->
      <template v-if="formModel.sourceType === 'DYNAMIC'">
        <NFormItem label="数据源标识" path="dsKey">
          <NSelect v-model:value="formModel.dsKey" :options="dynamicDsOptions" placeholder="选择动态数据源" />
        </NFormItem>
      </template>

      <!-- MANUAL 类型配置 -->
      <template v-else>
        <NFormItem label="驱动类名" path="driverClassName">
          <NInput v-model:value="formModel.driverClassName" placeholder="com.mysql.cj.jdbc.Driver" />
        </NFormItem>

        <NFormItem label="JDBC URL" path="jdbcUrl">
          <NInput
            v-model:value="formModel.jdbcUrl"
            type="textarea"
            :rows="2"
            placeholder="jdbc:mysql://localhost:3306/database"
          />
        </NFormItem>

        <NFormItem label="用户名" path="username">
          <NInput v-model:value="formModel.username" placeholder="请输入用户名" />
        </NFormItem>

        <NFormItem label="密码" path="password">
          <NInput
            v-model:value="formModel.password"
            type="password"
            placeholder="请输入密码"
            show-password-on="click"
          />
        </NFormItem>

        <NFormItem label="数据库类型" path="dbType">
          <NSelect
            v-model:value="formModel.dbType"
            :options="[
              { label: 'MySQL', value: 'mysql' },
              { label: 'PostgreSQL', value: 'postgresql' },
              { label: 'Oracle', value: 'oracle' }
            ]"
          />
        </NFormItem>
      </template>

      <NFormItem label="是否启用" path="isEnabled">
        <NSwitch v-model:value="formModel.isEnabled" checked-value="1" unchecked-value="0" />
      </NFormItem>
    </NForm>

    <template #footer>
      <div class="flex justify-end gap-3">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">确定</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
