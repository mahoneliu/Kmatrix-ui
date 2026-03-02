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
import { $t } from '@/locales';

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
  dataSourceName: [{ required: true, message: () => $t('ai.datasource.form.name_required'), trigger: 'blur' }],
  sourceType: [{ required: true, message: () => $t('ai.datasource.form.source_type_required'), trigger: 'change' }],
  dsKey: [
    {
      validator: (_rule, value) => {
        if (formModel.sourceType === 'DYNAMIC' && !value) {
          return new Error($t('ai.datasource.form.dynamic_ds_required'));
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
          return new Error($t('ai.datasource.form.driver_required'));
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
          return new Error($t('ai.datasource.form.jdbc_url_required'));
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
          return new Error($t('ai.datasource.form.username_required'));
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
      if (!error) message.success($t('ai.datasource.form.edit_success'));
    } else {
      const { error } = await addDataSource(formModel);
      if (!error) message.success($t('ai.datasource.form.add_success'));
    }
    emit('success');
  } catch (error: any) {
    if (error.message) {
      message.error($t('ai.datasource.form.submit_fail', { error: error.message }));
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
    :title="dataSource ? $t('ai.datasource.form.edit_title') : $t('ai.datasource.form.add_title')"
    class="w-180"
    @update:show="handleClose"
  >
    <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="120">
      <NFormItem :label="$t('ai.datasource.form.name_label')" path="dataSourceName">
        <NInput v-model:value="formModel.dataSourceName" :placeholder="$t('ai.datasource.form.name_placeholder')" />
      </NFormItem>

      <NFormItem :label="$t('ai.datasource.form.source_type_label')" path="sourceType">
        <NRadioGroup v-model:value="formModel.sourceType">
          <NRadioButton value="MANUAL">{{ $t('ai.datasource.form.type_manual_label') }}</NRadioButton>
          <NRadioButton value="DYNAMIC">{{ $t('ai.datasource.form.type_dynamic_label') }}</NRadioButton>
        </NRadioGroup>
      </NFormItem>

      <!-- DYNAMIC 类型配置 -->
      <template v-if="formModel.sourceType === 'DYNAMIC'">
        <NFormItem :label="$t('ai.datasource.form.ds_key_label')" path="dsKey">
          <NSelect
            v-model:value="formModel.dsKey"
            :options="dynamicDsOptions"
            :placeholder="$t('ai.datasource.form.dynamic_select')"
          />
        </NFormItem>
      </template>

      <!-- MANUAL 类型配置 -->
      <template v-else>
        <NFormItem :label="$t('ai.datasource.form.driver_label')" path="driverClassName">
          <NInput v-model:value="formModel.driverClassName" placeholder="com.mysql.cj.jdbc.Driver" />
        </NFormItem>

        <NFormItem :label="$t('ai.datasource.form.jdbc_url_label')" path="jdbcUrl">
          <NInput
            v-model:value="formModel.jdbcUrl"
            type="textarea"
            :rows="2"
            placeholder="jdbc:mysql://localhost:3306/database"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.datasource.form.username_label')" path="username">
          <NInput v-model:value="formModel.username" :placeholder="$t('ai.datasource.form.username_required')" />
        </NFormItem>

        <NFormItem :label="$t('ai.datasource.form.password_label')" path="password">
          <NInput
            v-model:value="formModel.password"
            type="password"
            :placeholder="$t('ai.datasource.form.password_placeholder')"
            show-password-on="click"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.datasource.form.db_type_label')" path="dbType">
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

      <NFormItem :label="$t('ai.datasource.form.is_enabled_label')" path="isEnabled">
        <NSwitch v-model:value="formModel.isEnabled" checked-value="1" unchecked-value="0" />
      </NFormItem>
    </NForm>

    <template #footer>
      <div class="flex justify-end gap-3">
        <NButton @click="handleClose">{{ $t('ai.datasource.form.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('ai.datasource.form.confirm') }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
